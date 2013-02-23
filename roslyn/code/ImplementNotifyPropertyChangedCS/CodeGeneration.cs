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

using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using Roslyn.Compilers;
using Roslyn.Compilers.Common;
using Roslyn.Compilers.CSharp;
using Roslyn.Services;
using Roslyn.Services.CodeGeneration;

namespace ImplementNotifyPropertyChangedCS
{
    internal static class CodeGeneration
    {
        /// <summary>
        /// Retrieves the get and set accessor declarations of the specified property.
        /// Returns true if both get and set accessors exist; otherwise false.
        /// </summary>
        internal static bool TryGetAccessors(
            PropertyDeclarationSyntax property,
            out AccessorDeclarationSyntax getter,
            out AccessorDeclarationSyntax setter)
        {
            var accessors = property.AccessorList.Accessors;
            getter = accessors.FirstOrDefault(ad => ad.Kind == SyntaxKind.GetAccessorDeclaration);
            setter = accessors.FirstOrDefault(ad => ad.Kind == SyntaxKind.SetAccessorDeclaration);

            return accessors.Count == 2 && getter != null && setter != null;
        }

        private static IFieldSymbol GetBackingFieldFromGetter(
            AccessorDeclarationSyntax getter,
            ISemanticModel semanticModel)
        {
            // The getter should have a body containing a single return of a backing field.

            if (getter.Body == null)
            {
                return null;
            }

            var statements = getter.Body.Statements;
            if (statements.Count != 1)
            {
                return null;
            }

            var returnStatement = statements.Single() as ReturnStatementSyntax;
            if (returnStatement == null || returnStatement.Expression == null)
            {
                return null;
            }

            return semanticModel.GetSymbolInfo(returnStatement.Expression).Symbol as IFieldSymbol;
        }

        private static bool IsExpandableGetter(
            AccessorDeclarationSyntax getter,
            ISemanticModel semanticModel,
            out IFieldSymbol backingField)
        {
            backingField = GetBackingFieldFromGetter(getter, semanticModel);

            return backingField != null;
        }

        private static bool IsBackingField(ExpressionSyntax expression, IFieldSymbol backingField, ISemanticModel semanticModel)
        {
            return semanticModel
                .GetSymbolInfo(expression).Symbol
                .Equals(backingField);
        }

        private static bool IsPropertyValueParameter(ExpressionSyntax expression, ISemanticModel semanticModel)
        {
            var parameterSymbol = semanticModel.GetSymbolInfo(expression).Symbol as IParameterSymbol;

            return parameterSymbol != null
                && parameterSymbol.IsImplicitlyDeclared
                && parameterSymbol.Name == "value";
        }

        private static bool IsAssignmentOfPropertyValueParameterToBackingField(
            ExpressionSyntax expression,
            IFieldSymbol backingField,
            ISemanticModel semanticModel)
        {
            if (expression.Kind != SyntaxKind.AssignExpression)
            {
                return false;
            }

            var assignment = (BinaryExpressionSyntax)expression;

            return IsBackingField(assignment.Left, backingField, semanticModel)
                && IsPropertyValueParameter(assignment.Right, semanticModel);
        }

        private static bool ComparesPropertyValueParameterAndBackingField(
            BinaryExpressionSyntax expression,
            IFieldSymbol backingField,
            ISemanticModel semanticModel)
        {
            return (IsPropertyValueParameter(expression.Right, semanticModel) && IsBackingField(expression.Left, backingField, semanticModel))
                || (IsPropertyValueParameter(expression.Left, semanticModel) && IsBackingField(expression.Right, backingField, semanticModel));
        }

        private static bool IsExpandableSetterPattern1(
            AccessorDeclarationSyntax setter,
            IFieldSymbol backingField,
            ISemanticModel semanticModel)
        {
            // Pattern: field = value

            Debug.Assert(setter.Body != null);

            var statements = setter.Body.Statements;
            if (statements.Count != 1)
            {
                return false;
            }

            var expressionStatement = statements[0] as ExpressionStatementSyntax;
            return expressionStatement != null
                && IsAssignmentOfPropertyValueParameterToBackingField(expressionStatement.Expression, backingField, semanticModel);
        }

        private static bool IsExpandableSetterPattern2(
            AccessorDeclarationSyntax setter,
            IFieldSymbol backingField,
            ISemanticModel semanticModel)
        {
            // Pattern: if (field != value) field = value;

            Debug.Assert(setter.Body != null);

            var statements = setter.Body.Statements;
            if (statements.Count != 1)
            {
                return false;
            }

            var ifStatement = statements[0] as IfStatementSyntax;
            if (ifStatement == null)
            {
                return false;
            }

            var statement = ifStatement.Statement;
            if (statement is BlockSyntax)
            {
                var blockStatements = ((BlockSyntax)statement).Statements;
                if (blockStatements.Count != 1)
                {
                    return false;
                }

                statement = blockStatements[0];
            }

            var expressionStatement = statement as ExpressionStatementSyntax;
            if (expressionStatement == null)
            {
                return false;
            }

            if (!IsAssignmentOfPropertyValueParameterToBackingField(expressionStatement.Expression, backingField, semanticModel))
            {
                return false;
            }

            var condition = ifStatement.Condition as BinaryExpressionSyntax;
            if (condition == null ||
                condition.Kind != SyntaxKind.NotEqualsExpression)
            {
                return false;
            }

            return ComparesPropertyValueParameterAndBackingField(condition, backingField, semanticModel);
        }

        private static bool IsExpandableSetterPattern3(
            AccessorDeclarationSyntax setter,
            IFieldSymbol backingField,
            ISemanticModel semanticModel)
        {
            // Pattern: if (field == value) return; field = value;

            Debug.Assert(setter.Body != null);

            var statements = setter.Body.Statements;
            if (statements.Count != 2)
            {
                return false;
            }

            var ifStatement = statements[0] as IfStatementSyntax;
            if (ifStatement == null)
            {
                return false;
            }

            var statement = ifStatement.Statement;
            if (statement is BlockSyntax)
            {
                var blockStatements = ((BlockSyntax)statement).Statements;
                if (blockStatements.Count != 1)
                {
                    return false;
                }

                statement = blockStatements[0];
            }

            var returnStatement = statement as ReturnStatementSyntax;
            if (returnStatement == null ||
                returnStatement.Expression != null)
            {
                return false;
            }

            var expressionStatement = statements[1] as ExpressionStatementSyntax;
            if (expressionStatement == null)
            {
                return false;
            }

            if (!IsAssignmentOfPropertyValueParameterToBackingField(expressionStatement.Expression, backingField, semanticModel))
            {
                return false;
            }

            var condition = ifStatement.Condition as BinaryExpressionSyntax;
            if (condition == null ||
                condition.Kind != SyntaxKind.EqualsExpression)
            {
                return false;
            }

            return ComparesPropertyValueParameterAndBackingField(condition, backingField, semanticModel);
        }

        private static bool IsExpandableSetter(AccessorDeclarationSyntax setter, ISemanticModel semanticModel, IFieldSymbol backingField)
        {
            // The setter should have a body containing one of the following heuristic patterns or
            // no body at all.
            //
            // Patterns:
            //    field = value;
            //    if (field != value) field = value;
            //    if (field == value) return; field = value;

            if (setter.Body == null)
            {
                return false;
            }

            return IsExpandableSetterPattern1(setter, backingField, semanticModel)
                || IsExpandableSetterPattern2(setter, backingField, semanticModel)
                || IsExpandableSetterPattern3(setter, backingField, semanticModel);
        }

        /// <summary>
        /// Returns true if the specified <see cref="PropertyDeclarationSyntax"/> can be expanded to include
        /// support for <see cref="INotifyPropertyChanged"/>.
        /// </summary>
        internal static bool IsExpandableProperty(PropertyDeclarationSyntax property, IDocument document)
        {
            // Don't expand properties with parse errors.
            if (property.ContainsDiagnostics)
            {
                return false;
            }

            // Don't expand static properties (since INotifyPropertyChanged only makes sense for instance properties).
            if (property.Modifiers.Any(SyntaxKind.StaticKeyword))
            {
                return false;
            }

            // Don't expand abstract properties.
            if (property.Modifiers.Any(SyntaxKind.AbstractKeyword))
            {
                return false;
            }

            // Only expand properties with both a getter and a setter.
            AccessorDeclarationSyntax getter, setter;
            if (!TryGetAccessors(property, out getter, out setter))
            {
                return false;
            }

            // Easy case: neither the getter or setter have a body.
            if (getter.Body == null && setter.Body == null)
            {
                return true;
            }

            var semanticModel = document.GetSemanticModel();

            IFieldSymbol backingField;
            return IsExpandableGetter(getter, semanticModel, out backingField)
                && IsExpandableSetter(setter, semanticModel, backingField);
        }

        private static string GenerateFieldName(PropertyDeclarationSyntax property, ISemanticModel semanticModel)
        {
            var baseName = property.Identifier.ValueText;
            baseName = char.ToLower(baseName[0]) + baseName.Substring(1);

            var propertySymbol = semanticModel.GetDeclaredSymbol(property);
            if (propertySymbol == null ||
                propertySymbol.ContainingType == null)
            {
                return baseName;
            }

            var index = 0;
            var name = baseName;
            while (propertySymbol.ContainingType.MemberNames.Contains(name))
            {
                name = baseName + ++index;
            }

            return name;
        }

        private static IDocument GetOrCreateBackingField(this IDocument document, SyntaxAnnotation propertyAnnotation, out IFieldSymbol backingField)
        {
            var semanticModel = document.GetSemanticModel();
            var property = document.GetAnnotatedNode<PropertyDeclarationSyntax>(propertyAnnotation);
            var propertySymbol = (IPropertySymbol)semanticModel.GetDeclaredSymbol(property);
            var getter = property.AccessorList.Accessors.First(a => a.Kind == SyntaxKind.GetAccessorDeclaration);

            if (getter.Body == null)
            {
                // When the getter doesn't have a body (i.e. an auto-prop), we'll need to generate a new field.
                var newField = SymbolFactory.CreateField(
                    attributes: null,
                    accessibility: CommonAccessibility.Private,
                    modifiers: new SymbolModifiers(),
                    type: propertySymbol.Type,
                    name: GenerateFieldName(property, semanticModel));

                var codeGenResult = newField.AddFieldTo(propertySymbol.ContainingType, document.Project.Solution);

                document = codeGenResult;
                semanticModel = document.GetSemanticModel();
                property = document.GetAnnotatedNode<PropertyDeclarationSyntax>(propertyAnnotation);
                propertySymbol = (IPropertySymbol)semanticModel.GetDeclaredSymbol(property);

                backingField = (IFieldSymbol)propertySymbol.ContainingType.GetMembers(newField.Name).Single();

                return document;
            }
            else
            {
                backingField = GetBackingFieldFromGetter(getter, semanticModel);
                return document;
            }
        }

        private static IDocument ExpandProperty(this IDocument document, SyntaxAnnotation propertyAnnotation, IFieldSymbol backingField)
        {
            var semanticModel = document.GetSemanticModel();
            var property = document.GetAnnotatedNode<PropertyDeclarationSyntax>(propertyAnnotation);

            AccessorDeclarationSyntax getter, setter;
            if (!TryGetAccessors(property, out getter, out setter))
            {
                return document;
            }

            if (getter.Body == null)
            {
                var returnFieldStatement = Syntax.ParseStatement(string.Format("return {0};", backingField.Name));
                getter = getter
                    .WithBody(Syntax.Block(Syntax.List(returnFieldStatement)));
            }

            getter = getter
                .WithSemicolonToken(default(SyntaxToken));

            var setPropertyStatement = Syntax.ParseStatement(string.Format("SetProperty(ref {0}, value, \"{1}\");", backingField.Name, property.Identifier.ValueText));
            setter = setter
                .WithBody(Syntax.Block(Syntax.List(setPropertyStatement)))
                .WithSemicolonToken(default(SyntaxToken));

            var newProperty = property
                .WithAccessorList(Syntax.AccessorList(Syntax.List(getter, setter)))
                .WithAdditionalAnnotations(CodeAnnotations.Formatting);

            var newRoot = document.GetSyntaxRoot().ReplaceNode(property, newProperty);
            return document.UpdateSyntaxRoot(newRoot);
        }

        internal static IDocument ExpandProperty(this IDocument document, PropertyDeclarationSyntax property)
        {
            // Annotate the property declaration so we can find it later.
            var propertyAnnotation = new SyntaxAnnotation();

            var newRoot = document.GetSyntaxRoot().ReplaceNode(
                property,
                property.WithAdditionalAnnotations(propertyAnnotation));

            IFieldSymbol backingField;
            return document
                .UpdateSyntaxRoot(newRoot)
                .GetOrCreateBackingField(propertyAnnotation, out backingField)
                .ExpandProperty(propertyAnnotation, backingField);
        }

        internal static IMethodSymbol GenerateSetPropertyMethod(CommonCompilation compilation)
        {
            var body = Syntax.ParseStatement(
                @"if (!System.Collections.Generic.EqualityComparer<T>.Default.Equals(field, value))
{
    field = value;

    var handler = PropertyChanged;
    if (handler != null)
    {
        handler(this, new System.ComponentModel.PropertyChangedEventArgs(name));
    }
}");

            body = body.WithAdditionalAnnotations(CodeAnnotations.Simplify);

            var stringType = compilation.GetSpecialType(SpecialType.System_String);
            var voidType = compilation.GetSpecialType(SpecialType.System_Void);

            var typeParameter = SymbolFactory.CreateTypeParameter("T");

            var parameter1 = SymbolFactory.CreateParameter(
                attributes: null,
                refKind: RefKind.Ref,
                isParams: false,
                type: typeParameter,
                name: "field");

            var parameter2 = SymbolFactory.CreateParameter(typeParameter, "value");
            var parameter3 = SymbolFactory.CreateParameter(stringType, "name");

            return SymbolFactory.CreateMethod(
                attributes: null,
                accessibility: CommonAccessibility.Private,
                modifiers: new SymbolModifiers(),
                returnType: voidType,
                explicitInterfaceSymbolOpt: null,
                name: "SetProperty",
                typeParameters: new[] { typeParameter },
                parameters: new[] { parameter1, parameter2, parameter3 },
                statements: new[] { body });
        }

        internal static IEventSymbol GeneratePropertyChangedEvent(CommonCompilation compilation)
        {
            var propertyChangedEventHandlerType = compilation.GetTypeByMetadataName("System.ComponentModel.PropertyChangedEventHandler");

            return SymbolFactory.CreateEvent(
                attributes: null,
                accessibility: CommonAccessibility.Public,
                modifiers: new SymbolModifiers(),
                type: propertyChangedEventHandlerType,
                explicitInterfaceSymbolOpt: null,
                name: "PropertyChanged");
        }

        private const string InterfaceName = "System.ComponentModel.INotifyPropertyChanged";

        private static IDocument AddBaseType(this IDocument document, SyntaxAnnotation classAnnotation)
        {
            var semanticModel = document.GetSemanticModel();
            var classDeclaration = document.GetAnnotatedNode<ClassDeclarationSyntax>(classAnnotation);
            var classSymbol = (INamedTypeSymbol)semanticModel.GetDeclaredSymbol(classDeclaration);

            var interfaceSymbol = semanticModel.Compilation.GetTypeByMetadataName(InterfaceName);

            // Does this class already implement INotifyPropertyChanged? If not, add it to the base list.
            if (!classSymbol.AllInterfaces.Any(i => i.Equals(interfaceSymbol)))
            {
                var baseTypeName = Syntax.ParseTypeName(InterfaceName)
                    .WithAdditionalAnnotations(CodeAnnotations.Simplify);

                var newClassDeclaration = classDeclaration.AddBaseListTypes(baseTypeName);

                // Add a formatting annotation to the base list to ensure that it gets formatted properly.
                newClassDeclaration = newClassDeclaration.ReplaceNode(
                    newClassDeclaration.BaseList,
                    newClassDeclaration.BaseList.WithAdditionalAnnotations(CodeAnnotations.Formatting));

                var newRoot = document.GetSyntaxRoot().ReplaceNode(classDeclaration, newClassDeclaration);
                return document.UpdateSyntaxRoot(newRoot);
            }

            return document;
        }

        private static IDocument AddPropertyChangedEvent(this IDocument document, SyntaxAnnotation classAnnotation)
        {
            var semanticModel = document.GetSemanticModel();
            var classDeclaration = document.GetAnnotatedNode<ClassDeclarationSyntax>(classAnnotation);
            var classSymbol = (INamedTypeSymbol)semanticModel.GetDeclaredSymbol(classDeclaration);

            var interfaceSymbol = semanticModel.Compilation.GetTypeByMetadataName(InterfaceName);
            var propertyChangedEventSymbol = (IEventSymbol)interfaceSymbol.GetMembers("PropertyChanged").Single();
            var propertyChangedEvent = classSymbol.FindImplementationForInterfaceMember(propertyChangedEventSymbol);

            // Does this class contain an implementation for the PropertyChanged event? If not, add it.
            if (propertyChangedEvent == null)
            {
                // Ensure that we add at the end of the class.
                var afterThisLocation = classDeclaration.Members.Any()
                    ? classDeclaration.Members.Last().GetLocation()
                    : null;

                var codeGenResult = GeneratePropertyChangedEvent(semanticModel.Compilation)
                    .AddEventTo(classSymbol,
                                document.Project.Solution,
                                new CodeGenerationOptions(afterThisLocation: afterThisLocation));

                return codeGenResult;
            }

            return document;
        }

        private static IMethodSymbol FindSetPropertyMethod(this INamedTypeSymbol classSymbol, CommonCompilation compilation)
        {
            // Find SetProperty<T>(ref T, T, string) method.
            var setPropertyMethod = classSymbol
                .GetMembers("SetProperty")
                .OfType<IMethodSymbol>()
                .FirstOrDefault(m => m.Parameters.Count == 3 && m.TypeParameters.Count == 1);

            if (setPropertyMethod != null)
            {
                var parameters = setPropertyMethod.Parameters;
                var typeParameter = setPropertyMethod.TypeParameters[0];
                var stringType = compilation.GetSpecialType(SpecialType.System_String);

                if (setPropertyMethod.ReturnsVoid &&
                    parameters[0].RefKind == RefKind.Ref &&
                    parameters[0].Type.Equals(typeParameter) &&
                    parameters[1].Type.Equals(typeParameter) &&
                    parameters[2].Type.Equals(stringType))
                {
                    return setPropertyMethod;
                }
            }

            return null;
        }

        private static IDocument AddSetPropertyMethod(this IDocument document, SyntaxAnnotation classAnnotation)
        {
            var semanticModel = document.GetSemanticModel();
            var classDeclaration = document.GetAnnotatedNode<ClassDeclarationSyntax>(classAnnotation);
            var classSymbol = (INamedTypeSymbol)semanticModel.GetDeclaredSymbol(classDeclaration);

            var interfaceSymbol = semanticModel.Compilation.GetTypeByMetadataName(InterfaceName);
            var propertyChangedEventSymbol = (IEventSymbol)interfaceSymbol.GetMembers("PropertyChanged").Single();
            var propertyChangedEvent = classSymbol.FindImplementationForInterfaceMember(propertyChangedEventSymbol);

            // Because the SetProperty<T>(ref T, T, string) method contains statements, we need to add the following
            // namespaces manually.
            var globalNamespace = semanticModel.Compilation.GlobalNamespace;
            var namespaces = new[]
            {
                globalNamespace.FindNamespace("System.ComponentModel"),
                globalNamespace.FindNamespace("System.Collections.Generic")
            };

            var setPropertyMethod = classSymbol.FindSetPropertyMethod(semanticModel.Compilation);
            if (setPropertyMethod == null)
            {
                // There isn't an existing SetProperty<T>(ref T, T, string) method, so let's create one.
                var beforeThisLocation = propertyChangedEvent != null
                    ? propertyChangedEvent.Locations.FirstOrDefault()
                    : null;

                var codeGenResult = GenerateSetPropertyMethod(semanticModel.Compilation)
                    .AddMethodTo(classSymbol,
                                 document.Project.Solution,
                                 new CodeGenerationOptions(
                                     beforeThisLocation: beforeThisLocation,
                                     additionalImports: namespaces));

                return codeGenResult;
            }

            return document;
        }

        internal static IDocument ImplementINotifyPropertyChanged(this IDocument document, ClassDeclarationSyntax classDeclaration)
        {
            // Annotate the class declaration so we can find it later.
            var classAnnotation = new SyntaxAnnotation();

            var newRoot = document.GetSyntaxRoot().ReplaceNode(
                classDeclaration,
                classDeclaration.WithAdditionalAnnotations(classAnnotation));

            return document
                .UpdateSyntaxRoot(newRoot)
                .AddBaseType(classAnnotation)
                .AddPropertyChangedEvent(classAnnotation)
                .AddSetPropertyMethod(classAnnotation);
        }
    }
}
