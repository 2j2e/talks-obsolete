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

using System.IO;
using Microsoft.VisualStudio.DebuggerVisualizers;

namespace Roslyn.Samples.SyntaxVisualizer.Debugger
{
    // A debugger visualizer for SyntaxTrees, SyntaxNodes, SyntaxTokens and SyntaxTrivia.
    public class SyntaxDebuggerVisualizer : DialogDebuggerVisualizer
    {
        internal const string Description = "Roslyn Syntax Visualizer";

        protected override void Show(IDialogVisualizerService windowService, IVisualizerObjectProvider objectProvider)
        {
            if (windowService != null && objectProvider != null)
            {
                // Get serialized object stream from debuggee side.
                Stream stream = objectProvider.GetData();

                if (stream != null && stream.Length > 0)
                {
                    // Deserialize the object stream.
                    var transporter = (SyntaxTransporter)SyntaxSerializer.Deserialize(stream);

                    if (transporter != null)
                    {
                        using (SyntaxDebuggerVisualizerForm form = new SyntaxDebuggerVisualizerForm())
                        {
                            // Display the deserialized object.
                            form.Display(transporter);
                            windowService.ShowDialog(form);
                        }
                    }
                }
            }
        }

        // Helper that simplifies testing of the visualizer by hosting it outside of the debugger.
        public static void TestShowVisualizer(object objectToVisualize)
        {
            var host = new VisualizerDevelopmentHost(objectToVisualize,
                    typeof(SyntaxDebuggerVisualizer), typeof(SyntaxSerializer));
            host.ShowVisualizer();
        }
    }
}
