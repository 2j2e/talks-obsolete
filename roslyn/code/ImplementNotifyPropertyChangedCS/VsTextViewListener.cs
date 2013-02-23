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

using System.ComponentModel.Composition;
using Microsoft.VisualStudio.Editor;
using Microsoft.VisualStudio.Shell;
using Microsoft.VisualStudio.Text.Editor;
using Microsoft.VisualStudio.TextManager.Interop;
using Microsoft.VisualStudio.Utilities;
using Roslyn.Services.Editor;

namespace ImplementNotifyPropertyChangedCS
{
    [Export(typeof(IVsTextViewCreationListener))]
    [ContentType("CSharp")]
    [ContentType(ContentTypeNames.CSharpContentType)]
    [TextViewRole(PredefinedTextViewRoles.Editable)]
    internal sealed class VsTextViewListener : IVsTextViewCreationListener
    {
        private readonly IVsEditorAdaptersFactoryService editorAdaptersFactory;
        private readonly SVsServiceProvider serviceProvider;

        [ImportingConstructor]
        public VsTextViewListener(
            IVsEditorAdaptersFactoryService editorAdaptersFactory,
            SVsServiceProvider serviceProvider)
        {
            this.editorAdaptersFactory = editorAdaptersFactory;
            this.serviceProvider = serviceProvider;
        }

        public void VsTextViewCreated(IVsTextView textViewAdapter)
        {
            var wpfTextView = editorAdaptersFactory.GetWpfTextView(textViewAdapter);

            // Add an instance of CommandTarget to the view. CommandTarget adds itself to the view's
            // filter chain to receive and respond to VS commands.
            var commandTarget = new CommandTarget(textViewAdapter, wpfTextView, serviceProvider);
            wpfTextView.Properties.AddProperty(typeof(CommandTarget), commandTarget);
        }
    }
}
