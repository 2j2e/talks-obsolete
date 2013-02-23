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
using System.ComponentModel;
using System.Linq;
using Roslyn.Compilers;
using Roslyn.Compilers.CSharp;
using Roslyn.Services;

namespace ImplementNotifyPropertyChangedCS
{
    internal static class Implementer
    {
        private static IDocument GetDocument(IText text)
        {
            ProjectId projectId;
            DocumentId documentId;
            return Solution.Create(SolutionId.CreateNewId())
                .AddCSharpProject("NotifyPropertyChanged", "NotifyPropertyChanged", out projectId)
                .AddMetadataReference(projectId, MetadataReference.CreateAssemblyReference("mscorlib"))
                .AddMetadataReference(projectId, MetadataReference.CreateAssemblyReference("System"))
                .AddDocument(projectId, "ThisFile", text, out documentId)
                .GetDocument(documentId);
        }

        public static bool IsAvailable(IText text, TextSpan span)
        {
            var document = GetDocument(text);

            return document.GetSyntaxRoot()
                .DescendantNodes(span)
                .OfType<PropertyDeclarationSyntax>()
                .Where(p => CodeGeneration.IsExpandableProperty(p, document))
                .Any();
        }

        public static CompilationUnitSyntax Apply(IText text, TextSpan span, out IEnumerable<SyntaxAnnotation> propertyAnnotations)
        {
            var document = GetDocument(text);
            document = PropertyAnnotater.Annotate(document, span, out propertyAnnotations);

            foreach (var propertyAnnotation in propertyAnnotations)
            {
                var propertyDeclaration = document.GetAnnotatedNode<PropertyDeclarationSyntax>(propertyAnnotation);
                document = document.ExpandProperty(propertyDeclaration);

                propertyDeclaration = document.GetAnnotatedNode<PropertyDeclarationSyntax>(propertyAnnotation);
                var classDeclaration = propertyDeclaration.FirstAncestorOrSelf<ClassDeclarationSyntax>();
                document = document.ImplementINotifyPropertyChanged(classDeclaration);
            }

            var newRoot = document
                .Simplify(CodeAnnotations.Simplify)
                .Format(CodeAnnotations.Formatting)
                .GetSyntaxRoot();

            return (CompilationUnitSyntax)newRoot;
        }
    }
}
