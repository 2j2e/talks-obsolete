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

using System.Diagnostics;
using Roslyn.Compilers.Common;
using Roslyn.Samples.SyntaxVisualizer.Debugger;
using CSharp = Roslyn.Compilers.CSharp;
using VisualBasic = Roslyn.Compilers.VisualBasic;

// Assembly-level attributes that register SyntaxDebuggerVisualizer
// as a debugger visualizer for SyntaxTrees, SyntaxNodes,
// SyntaxTokens and SyntaxTrivia.

[assembly: DebuggerVisualizer(typeof(SyntaxDebuggerVisualizer),
    typeof(SyntaxSerializer),
    Target = typeof(CommonSyntaxTree),
    Description = SyntaxDebuggerVisualizer.Description)]

[assembly: DebuggerVisualizer(typeof(SyntaxDebuggerVisualizer),
    typeof(SyntaxSerializer),
    Target = typeof(CommonSyntaxNodeOrToken),
    Description = SyntaxDebuggerVisualizer.Description)]

[assembly: DebuggerVisualizer(typeof(SyntaxDebuggerVisualizer),
    typeof(SyntaxSerializer),
    Target = typeof(CommonSyntaxNode),
    Description = SyntaxDebuggerVisualizer.Description)]

[assembly: DebuggerVisualizer(typeof(SyntaxDebuggerVisualizer),
    typeof(SyntaxSerializer),
    Target = typeof(CommonSyntaxToken),
    Description = SyntaxDebuggerVisualizer.Description)]

[assembly: DebuggerVisualizer(typeof(SyntaxDebuggerVisualizer),
    typeof(SyntaxSerializer),
    Target = typeof(CommonSyntaxTrivia),
    Description = SyntaxDebuggerVisualizer.Description)]

[assembly: DebuggerVisualizer(typeof(SyntaxDebuggerVisualizer),
    typeof(SyntaxSerializer),
    Target = typeof(CSharp.SyntaxNodeOrToken),
    Description = SyntaxDebuggerVisualizer.Description)]

[assembly: DebuggerVisualizer(typeof(SyntaxDebuggerVisualizer),
    typeof(SyntaxSerializer),
    Target = typeof(CSharp.SyntaxToken),
    Description = SyntaxDebuggerVisualizer.Description)]

[assembly: DebuggerVisualizer(typeof(SyntaxDebuggerVisualizer),
    typeof(SyntaxSerializer),
    Target = typeof(CSharp.SyntaxTrivia),
    Description = SyntaxDebuggerVisualizer.Description)]

[assembly: DebuggerVisualizer(typeof(SyntaxDebuggerVisualizer),
    typeof(SyntaxSerializer),
    Target = typeof(VisualBasic.SyntaxNodeOrToken),
    Description = SyntaxDebuggerVisualizer.Description)]

[assembly: DebuggerVisualizer(typeof(SyntaxDebuggerVisualizer),
    typeof(SyntaxSerializer),
    Target = typeof(VisualBasic.SyntaxToken),
    Description = SyntaxDebuggerVisualizer.Description)]

[assembly: DebuggerVisualizer(typeof(SyntaxDebuggerVisualizer),
    typeof(SyntaxSerializer),
    Target = typeof(VisualBasic.SyntaxTrivia),
    Description = SyntaxDebuggerVisualizer.Description)]