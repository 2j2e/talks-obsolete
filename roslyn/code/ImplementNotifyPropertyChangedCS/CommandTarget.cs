// *********************************************************
//
// Copyright © Microsoft Corporation
//
// Licensed under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in
// compliance with the License. You may obtain a copy of
// the License at
//
// http://www.apache.org/licenses/LICENSE-2.0 
//
// THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES
// OR CONDITIONS OF ANY KIND, EITHER EXPRESS OR IMPLIED,
// INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES
// OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR
// PURPOSE, MERCHANTABILITY OR NON-INFRINGEMENT.
//
// See the Apache 2 License for the specific language
// governing permissions and limitations under the License.
//
// *********************************************************

using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using EnvDTE;
using Microsoft.VisualStudio;
using Microsoft.VisualStudio.OLE.Interop;
using Microsoft.VisualStudio.Shell;
using Microsoft.VisualStudio.Shell.Interop;
using Microsoft.VisualStudio.Text;
using Microsoft.VisualStudio.Text.Editor;
using Microsoft.VisualStudio.TextManager.Interop;
using Roslyn.Compilers;
using Roslyn.Compilers.CSharp;
using TextSpan = Roslyn.Compilers.TextSpan;

namespace ImplementNotifyPropertyChangedCS
{
    internal sealed class CommandTarget : IOleCommandTarget
    {
        private readonly IWpfTextView wpfTextView;
        private readonly SVsServiceProvider serviceProvider;
        private readonly IOleCommandTarget nextCommandTarget;

        public CommandTarget(
            IVsTextView vsTextView,
            IWpfTextView wpfTextView,
            SVsServiceProvider serviceProvider)
        {
            this.wpfTextView = wpfTextView;
            this.serviceProvider = serviceProvider;

            // Add command filter to IVsTextView. If something goes wrong, throw.
            var returnValue = vsTextView.AddCommandFilter(this, out nextCommandTarget);
            Marshal.ThrowExceptionForHR(returnValue);
        }

        private TextSpan GetSelectionSpan()
        {
            var start = wpfTextView.Selection.SelectedSpans.Min(s => s.Start).Position;
            var end = wpfTextView.Selection.SelectedSpans.Max(s => s.End).Position;
            return TextSpan.FromBounds(start, end);
        }

        private IText GetText()
        {
            return new StringText(wpfTextView.TextBuffer.CurrentSnapshot.GetText());
        }

        private void FormatDocument()
        {
            // This is a bit of a cheat because we only format the active document.
            // This assumes that we're always executed on the active document.
            var dte = serviceProvider.GetService(typeof(SDTE)) as DTE;
            if (dte != null)
            {
                dte.ExecuteCommand("Edit.FormatDocument");
            }
        }

        int IOleCommandTarget.Exec(ref Guid commandGroupId, uint commandId, uint executeInformation, IntPtr inVar, IntPtr outVar)
        {
            if (commandGroupId == Guids.CommandSetId)
            {
                switch (commandId)
                {
                    case CommandIDs.ImplementNotifyPropertyChangedCommandId:
                        // TODO: Wrap in undo transaction

                        IEnumerable<SyntaxAnnotation> propertyAnnotations;
                        var newCompUnit = Implementer.Apply(GetText(), GetSelectionSpan(), out propertyAnnotations);

                        // Store the top line number in view so we can reset it afterwards
                        var topLineNumber = wpfTextView.TextViewLines.FirstVisibleLine.Start.GetContainingLine().LineNumber;

                        var buffer = wpfTextView.TextBuffer;
                        buffer.Replace(new Span(0, buffer.CurrentSnapshot.Length), newCompUnit.ToString());

                        var snapshot = buffer.CurrentSnapshot;

                        var annotatedProperties = propertyAnnotations.Select(annotation => newCompUnit.GetAnnotatedNode<PropertyDeclarationSyntax>(annotation));

                        // Create tracking points from the start of the first property that we expanded to the end of the last property.
                        var selectionStart = snapshot.CreateTrackingPoint(annotatedProperties.First().Span.Start, PointTrackingMode.Negative);
                        var selectionEnd = snapshot.CreateTrackingPoint(annotatedProperties.Last().Span.End, PointTrackingMode.Positive);

                        FormatDocument();

                        // After formatting, use our tracking points to select the expanded properties
                        var formattedSnapshot = buffer.CurrentSnapshot;
                        wpfTextView.Selection.Select(
                            new VirtualSnapshotPoint(selectionStart.GetPoint(formattedSnapshot)),
                            new VirtualSnapshotPoint(selectionEnd.GetPoint(formattedSnapshot)));

                        // Reset the top line in view
                        var topLine = formattedSnapshot.GetLineFromLineNumber(topLineNumber);
                        wpfTextView.DisplayTextLineContainingBufferPosition(topLine.Start, 0.0, ViewRelativePosition.Top);

                        return VSConstants.S_OK;
                }
            }

            return nextCommandTarget.Exec(ref commandGroupId, commandId, executeInformation, inVar, outVar);
        }

        int IOleCommandTarget.QueryStatus(ref Guid commandGroupId, uint commandCount, OLECMD[] commands, IntPtr commandText)
        {
            if (commandGroupId == Guids.CommandSetId)
            {
                switch (commands[0].cmdID)
                {
                    case CommandIDs.ImplementNotifyPropertyChangedCommandId:
                        if (Implementer.IsAvailable(GetText(), GetSelectionSpan()))
                        {
                            commands[0].cmdf = (uint)(OLECMDF.OLECMDF_ENABLED | OLECMDF.OLECMDF_SUPPORTED);
                        }
                        else
                        {
                            commands[0].cmdf = (uint)(OLECMDF.OLECMDF_SUPPORTED);
                        }

                        return VSConstants.S_OK;
                }
            }

            return nextCommandTarget.QueryStatus(ref commandGroupId, commandCount, commands, commandText);
        }
    }
}
