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
using Roslyn.Compilers.Common;
using CSharp = Roslyn.Compilers.CSharp;
using VisualBasic = Roslyn.Compilers.VisualBasic;

namespace Roslyn.Samples.SyntaxVisualizer.Debugger
{
    // A serializer for transporting a SyntaxTree / SyntaxNode / SyntaxToken / SyntaxTrivia
    // from the debuggee to the debugger side.
    internal class SyntaxSerializer : VisualizerObjectSource
    {
        public override void GetData(object target, Stream outgoingData)
        {
            SyntaxTransporter transporter = null;

            if (target != null)
            {
                if (target is CommonSyntaxTree)
                {
                    var tree = (CommonSyntaxTree)target;
                    transporter = new SyntaxTransporter(tree);
                }
                else if (target is CommonSyntaxNodeOrToken)
                {
                    var nodeOrToken = (CommonSyntaxNodeOrToken)target;
                    transporter = new SyntaxTransporter(nodeOrToken);
                }
                else if (target is CommonSyntaxNode)
                {
                    var node = (CommonSyntaxNode)target;
                    transporter = new SyntaxTransporter(node);
                }
                else if (target is CommonSyntaxToken)
                {
                    var token = (CommonSyntaxToken)target;
                    transporter = new SyntaxTransporter(token);
                }
                else if (target is CommonSyntaxTrivia)
                {
                    var trivia = (CommonSyntaxTrivia)target;
                    transporter = new SyntaxTransporter(trivia);
                }
                else if (target is CSharp.SyntaxNodeOrToken)
                {
                    var nodeOrToken = (CSharp.SyntaxNodeOrToken)target;
                    transporter = new SyntaxTransporter(nodeOrToken);
                }
                else if (target is CSharp.SyntaxToken)
                {
                    var token = (CSharp.SyntaxToken)target;
                    transporter = new SyntaxTransporter(token);
                }
                else if (target is CSharp.SyntaxTrivia)
                {
                    var trivia = (CSharp.SyntaxTrivia)target;
                    transporter = new SyntaxTransporter(trivia);
                }
                else if (target is VisualBasic.SyntaxNodeOrToken)
                {
                    var nodeOrToken = (VisualBasic.SyntaxNodeOrToken)target;
                    transporter = new SyntaxTransporter(nodeOrToken);
                }
                else if (target is VisualBasic.SyntaxToken)
                {
                    var token = (VisualBasic.SyntaxToken)target;
                    transporter = new SyntaxTransporter(token);
                }
                else if (target is VisualBasic.SyntaxTrivia)
                {
                    var trivia = (VisualBasic.SyntaxTrivia)target;
                    transporter = new SyntaxTransporter(trivia);
                }
            }

            Serialize(outgoingData, transporter);
        }
    }
}
