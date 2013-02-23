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
using System.Windows.Media;
using Roslyn.Compilers.CSharp;
using Roslyn.Services;
using Roslyn.Services.Editor;

namespace ConvertToAutoPropertyCS
{
    internal class CodeAction : ICodeAction
    {
        private readonly IDocument document;
        private readonly PropertyDeclarationSyntax property;

        public ImageSource Icon { get; private set; }
        public string Description { get; private set; }

        public CodeAction(IDocument document, PropertyDeclarationSyntax property)
        {
            this.document = document;
            this.property = property;

            this.Description = "Convert to auto property";
            this.Icon = null;
        }

        public CodeActionEdit GetEdit(CancellationToken cancellationToken)
        {
            var tree = (SyntaxTree)document.GetSyntaxTree(cancellationToken);
            var semanticModel = (SemanticModel)document.GetSemanticModel(cancellationToken);

            // Retrieves the get accessor declarations of the specified property.
            var getter = property.AccessorList.Accessors.FirstOrDefault(ad => ad.Kind == SyntaxKind.GetAccessorDeclaration);

            // Retrieves the type that contains the specified property
            var containingType = semanticModel.GetDeclaredSymbol(property).ContainingType;

            // Find the backing field of the property
            var backingField = GetBackingField(getter, containingType);

            // Rewrite property
            var propertyRewriter = new PropertyRewriter(semanticModel, backingField, property);
            var newRoot = propertyRewriter.Visit(tree.GetRoot(cancellationToken));

            return new CodeActionEdit(document.UpdateSyntaxRoot(newRoot));
        }

        private Symbol GetBackingField(AccessorDeclarationSyntax getter, NamedTypeSymbol containingType)
        {
            var statements = getter.Body.Statements;
            if (statements.Count == 1)
            {
                var returnStatement = statements.FirstOrDefault() as ReturnStatementSyntax;
                if (returnStatement != null && returnStatement.Expression != null)
                {
                    var symbolInfo = document.GetSemanticModel().GetSymbolInfo(returnStatement.Expression);
                    var fieldSymbol = symbolInfo.Symbol as FieldSymbol;

                    if (fieldSymbol != null && fieldSymbol.OriginalDefinition.ContainingType == containingType)
                    {
                        return fieldSymbol;
                    }
                }
            }

            return null;
        }
    }
}