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

using System.Collections.Generic;
using Roslyn.Compilers;
using Roslyn.Compilers.CSharp;
using Roslyn.Services;

namespace ImplementNotifyPropertyChangedCS
{
    internal class PropertyAnnotater : SyntaxRewriter
    {
        private readonly IDocument document;
        private readonly TextSpan span;
        private readonly List<SyntaxAnnotation> annotations;

        private PropertyAnnotater(IDocument document, TextSpan span)
        {
            this.document = document;
            this.span = span;
            this.annotations = new List<SyntaxAnnotation>();
        }

        public override SyntaxNode VisitPropertyDeclaration(PropertyDeclarationSyntax property)
        {
            if (span.IntersectsWith(property.Span) && CodeGeneration.IsExpandableProperty(property, document))
            {
                var annotation = new SyntaxAnnotation();
                annotations.Add(annotation);

                return property.WithAdditionalAnnotations(annotation);
            }

            return base.VisitPropertyDeclaration(property);
        }

        public static IDocument Annotate(IDocument document, TextSpan span, out IEnumerable<SyntaxAnnotation> annotations)
        {
            var oldRoot = (CompilationUnitSyntax)document.GetSyntaxRoot();
            var propertyAnnotater = new PropertyAnnotater(document, span);
            var newRoot = (CompilationUnitSyntax)propertyAnnotater.Visit(oldRoot);
            annotations = propertyAnnotater.annotations;
            return document.UpdateSyntaxRoot(newRoot);
        }
    }
}
