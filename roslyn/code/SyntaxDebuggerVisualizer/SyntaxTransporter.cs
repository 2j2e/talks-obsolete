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
using System.IO;
using Roslyn.Compilers;
using Roslyn.Compilers.Common;
using Roslyn.Samples.SyntaxVisualizer.Control;
using CSharp = Roslyn.Compilers.CSharp;
using VisualBasic = Roslyn.Compilers.VisualBasic;

namespace Roslyn.Samples.SyntaxVisualizer.Debugger
{
    // A transporter that represents a serialized SyntaxTree / SyntaxNode / SyntaxToken / SyntaxTrivia.
    [Serializable]
    internal class SyntaxTransporter
    {
        #region Serialized Properties
        // The language (C# / VB) for the SyntaxTree / SyntaxNode / SyntaxToken /
        // SyntaxTrivia being serialized.
        internal string SourceLanguage { get; private set; }

        // An object stream containing the root SyntaxNode of the SyntaxTree being serialized / of the
        // SyntaxTree containing the SyntaxNode / SyntaxToken / SyntaxTrivia being serialized.
        private Stream SyntaxStream { get; set; }

        // The Span for the root SyntaxNode of the SyntaxTree being serialized / of the
        // SyntaxNode / SyntaxToken / SyntaxTrivia being serialized.
        internal TextSpan ItemSpan { get; private set; }

        // The SyntaxKind for the root SyntaxNode of the SyntaxTree being serialized / of the
        // SyntaxNode / SyntaxToken / SyntaxTrivia being serialized.
        internal string ItemKind { get; private set; }

        // Indicates whether the item being serialized is a SyntaxNode / SyntaxToken / SyntaxTrivia.
        internal SyntaxCategory ItemCategory { get; private set; }
        #endregion

        #region Helpers - GetRootNode
        // Helpers that return the root SyntaxNode for a supplied SyntaxNode / SyntaxToken / SyntaxTrivia.

        private CommonSyntaxNode GetRootNode(CommonSyntaxNode node)
        {
            if (node != null && node.SyntaxTree != null)
            {
                node = node.SyntaxTree.GetRoot();
            }
            else
            {
                while (node != null && node.Parent != null)
                {
                    node = node.Parent;
                }
            }

            return node;
        }

        private CommonSyntaxNode GetRootNode(CommonSyntaxNodeOrToken nodeOrToken)
        {
            if (nodeOrToken.IsNode)
            {
                return GetRootNode(nodeOrToken.AsNode());
            }
            else
            {
                return GetRootNode(nodeOrToken.AsToken());
            }
        }

        private CommonSyntaxNode GetRootNode(CommonSyntaxToken token)
        {
            CommonSyntaxNode rootNode = null;
            if (token.SyntaxTree != null)
            {
                rootNode = token.SyntaxTree.GetRoot();
            }
            else
            {
                rootNode = GetRootNode(token.Parent);
            }

            return rootNode;
        }

        private CommonSyntaxNode GetRootNode(CommonSyntaxTrivia trivia)
        {
            CommonSyntaxNode rootNode = null;
            if (trivia.SyntaxTree != null)
            {
                rootNode = trivia.SyntaxTree.GetRoot();
            }
            else
            {
                rootNode = GetRootNode(trivia.Token);
            }

            return rootNode;
        }
        #endregion

        #region Constructors
        internal SyntaxTransporter(CommonSyntaxTree tree)
        {
            SyntaxStream = new MemoryStream();
            if (tree is CSharp.SyntaxTree)
            {
                SourceLanguage = LanguageNames.CSharp;
                var csharpTree = (CSharp.SyntaxTree)tree;
                csharpTree.GetRoot().SerializeTo(SyntaxStream);
            }
            else
            {
                SourceLanguage = LanguageNames.VisualBasic;
                var vbTree = (VisualBasic.SyntaxTree)tree;
                vbTree.GetRoot().SerializeTo(SyntaxStream);
            }

            ItemSpan = tree.GetRoot().Span;
            ItemKind = tree.GetRoot().GetKind(SourceLanguage);
            ItemCategory = SyntaxCategory.SyntaxNode;
        }

        internal SyntaxTransporter(CommonSyntaxNodeOrToken nodeOrToken)
        {
            try
            {
                var t = (CSharp.SyntaxNodeOrToken)nodeOrToken;
                SourceLanguage = LanguageNames.CSharp;
            }
            catch
            {
                var t = (VisualBasic.SyntaxNodeOrToken)nodeOrToken;
                SourceLanguage = LanguageNames.VisualBasic;
            }

            SyntaxStream = new MemoryStream();
            var rootNode = GetRootNode(nodeOrToken);
            if (rootNode != null)
            {
                if (SourceLanguage == LanguageNames.CSharp)
                {
                    var csharpRootNode = (CSharp.SyntaxNode)rootNode;
                    csharpRootNode.SerializeTo(SyntaxStream);
                }
                else
                {
                    var vbRootNode = (VisualBasic.SyntaxNode)rootNode;
                    vbRootNode.SerializeTo(SyntaxStream);
                }
            }

            ItemSpan = nodeOrToken.Span;
            ItemKind = nodeOrToken.GetKind(SourceLanguage);
            if (nodeOrToken.IsNode)
            {
                ItemCategory = SyntaxCategory.SyntaxNode;
            }
            else
            {
                ItemCategory = SyntaxCategory.SyntaxToken;
            }
        }

        internal SyntaxTransporter(CommonSyntaxNode node)
        {
            if (node is CSharp.SyntaxNode)
            {
                SourceLanguage = LanguageNames.CSharp;
            }
            else
            {
                SourceLanguage = LanguageNames.VisualBasic;
            }

            SyntaxStream = new MemoryStream();
            var rootNode = GetRootNode(node);
            if (rootNode != null)
            {
                if (SourceLanguage == LanguageNames.CSharp)
                {
                    var csharpRootNode = (CSharp.SyntaxNode)rootNode;
                    csharpRootNode.SerializeTo(SyntaxStream);
                }
                else
                {
                    var vbRootNode = (VisualBasic.SyntaxNode)rootNode;
                    vbRootNode.SerializeTo(SyntaxStream);
                }
            }

            ItemSpan = node.Span;
            ItemKind = node.GetKind(SourceLanguage);
            ItemCategory = SyntaxCategory.SyntaxNode;
        }

        internal SyntaxTransporter(CommonSyntaxToken token)
        {
            try
            {
                var t = (CSharp.SyntaxToken)token;
                SourceLanguage = LanguageNames.CSharp;
            }
            catch
            {
                var t = (VisualBasic.SyntaxToken)token;
                SourceLanguage = LanguageNames.VisualBasic;
            }

            SyntaxStream = new MemoryStream();
            var rootNode = GetRootNode(token);
            if (rootNode != null)
            {
                if (SourceLanguage == LanguageNames.CSharp)
                {
                    var csharpRootNode = (CSharp.SyntaxNode)rootNode;
                    csharpRootNode.SerializeTo(SyntaxStream);
                }
                else
                {
                    var vbRootNode = (VisualBasic.SyntaxNode)rootNode;
                    vbRootNode.SerializeTo(SyntaxStream);
                }
            }

            ItemSpan = token.Span;
            ItemKind = token.GetKind(SourceLanguage);
            ItemCategory = SyntaxCategory.SyntaxToken;
        }

        internal SyntaxTransporter(CommonSyntaxTrivia trivia)
        {
            try
            {
                var t = (CSharp.SyntaxTrivia)trivia;
                SourceLanguage = LanguageNames.CSharp;
            }
            catch
            {
                var t = (VisualBasic.SyntaxTrivia)trivia;
                SourceLanguage = LanguageNames.VisualBasic;
            }

            SyntaxStream = new MemoryStream();
            var rootNode = GetRootNode(trivia);
            if (rootNode != null)
            {
                if (SourceLanguage == LanguageNames.CSharp)
                {
                    var csharpRootNode = (CSharp.SyntaxNode)rootNode;
                    csharpRootNode.SerializeTo(SyntaxStream);
                }
                else
                {
                    var vbRootNode = (VisualBasic.SyntaxNode)rootNode;
                    vbRootNode.SerializeTo(SyntaxStream);
                }
            }

            ItemSpan = trivia.Span;
            ItemKind = trivia.GetKind(SourceLanguage);
            ItemCategory = SyntaxCategory.SyntaxTrivia;
        }
        #endregion

        internal CommonSyntaxNode GetSyntaxNode()
        {
            CommonSyntaxNode node = null;

            if (SyntaxStream != null && SyntaxStream.Length > 0)
            {
                SyntaxStream.Position = 0;

                if (SourceLanguage == LanguageNames.CSharp)
                {
                    node = CSharp.SyntaxNode.DeserializeFrom(SyntaxStream);
                }
                else if (SourceLanguage == LanguageNames.VisualBasic)
                {
                    node = VisualBasic.SyntaxNode.DeserializeFrom(SyntaxStream);
                }
            }

            return node;
        }
    }
}
