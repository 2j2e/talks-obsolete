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

using System.Linq;
using System.Threading;
using Roslyn.Compilers;
using Roslyn.Compilers.CSharp;
using Roslyn.Services;
using Roslyn.Services.Editor;

namespace ConvertToAutoPropertyCS
{
    [ExportCodeRefactoringProvider("ConvertToAutoPropertyCS", LanguageNames.CSharp)]
    internal class CodeRefactoringProvider : ICodeRefactoringProvider
    {
        public CodeRefactoring GetRefactoring(IDocument document, TextSpan textSpan, CancellationToken cancellationToken)
        {
            var syntaxTree = document.GetSyntaxTree(cancellationToken);
            var token = syntaxTree.GetRoot(cancellationToken).FindToken(textSpan.Start);
            if (token.Parent == null)
            {
                return null;
            }

            var propertyDeclaration = token.Parent.FirstAncestorOrSelf<PropertyDeclarationSyntax>();

            // Refactor only properties with both a getter and a setter.
            if (propertyDeclaration == null || !HasBothAccessors(propertyDeclaration))
            {
                return null;
            }

            return new CodeRefactoring(
                actions: new[] { new CodeAction(document, propertyDeclaration) },
                textSpan: propertyDeclaration.Identifier.Span);
        }

        /// <summary>
        /// Returns true if both get and set accessors exist on the given property; otherwise false.
        /// </summary>
        private static bool HasBothAccessors(BasePropertyDeclarationSyntax property)
        {
            var accessors = property.AccessorList.Accessors;
            var getter = accessors.FirstOrDefault(ad => ad.Kind == SyntaxKind.GetAccessorDeclaration);
            var setter = accessors.FirstOrDefault(ad => ad.Kind == SyntaxKind.SetAccessorDeclaration);

            if (getter != null && setter != null)
            {
                // The getter and setter should have a body.
                return getter.Body != null && setter.Body != null;
            }

            return false;
        }
    }
}