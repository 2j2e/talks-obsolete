﻿// *********************************************************
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
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Roslyn.Compilers;
using Roslyn.Compilers.CSharp;

namespace APISampleUnitTestsCS
{
    [TestClass]
    public class SyntaxTrees
    {
        [TestMethod]
        public void FindNodeUsingMembers()
        {
            string text = "class C { void M(int i) { } }";
            var tree = SyntaxTree.ParseText(text);
            var compilationUnit = (CompilationUnitSyntax)tree.GetRoot();
            var typeDeclaration = (TypeDeclarationSyntax)compilationUnit.Members[0];
            var methodDeclaration = (MethodDeclarationSyntax)typeDeclaration.Members[0];
            ParameterSyntax parameter = methodDeclaration.ParameterList.Parameters[0];
            SyntaxToken parameterName = parameter.Identifier;
            Assert.AreEqual("i", parameterName.ValueText);
        }

        [TestMethod]
        public void FindNodeUsingQuery()
        {
            string text = "class C { void M(int i) { } }";
            SyntaxNode root = Syntax.ParseCompilationUnit(text);
            var parameterDeclaration = root
                .DescendantNodes()
                .OfType<ParameterSyntax>()
                .First();
            Assert.AreEqual("i", parameterDeclaration.Identifier.ValueText);
        }

        [TestMethod]
        public void UpdateNode()
        {
            string text = "class C { void M() { } }";
            var tree = SyntaxTree.ParseText(text);
            var root = (CompilationUnitSyntax)tree.GetRoot();
            MethodDeclarationSyntax method = root
                .DescendantNodes()
                .OfType<MethodDeclarationSyntax>()
                .First();
            var newMethod = method.Update(
                method.AttributeLists,
                method.Modifiers,
                method.ReturnType,
                method.ExplicitInterfaceSpecifier,
                Syntax.Identifier("NewMethodName"),
                method.TypeParameterList,
                method.ParameterList,
                method.ConstraintClauses,
                method.Body,
                method.SemicolonToken);

            root = root.ReplaceNode(method, newMethod);
            tree = SyntaxTree.Create(root, tree.FilePath, tree.Options);
            Assert.AreEqual("class C { void NewMethodName() { } }", tree.GetText().ToString());
        }

        [TestMethod]
        public void InsertNode()
        {
            string text = "class C { void M() { } }";
            var tree = SyntaxTree.ParseText(text);
            var root = (CompilationUnitSyntax)tree.GetRoot();
            var classNode = root.ChildNodes().First() as ClassDeclarationSyntax;
            
            var newMethod = Syntax.MethodDeclaration(Syntax.ParseTypeName("int"), Syntax.Identifier("NewMethod"))
                .WithBody(Syntax.Block());

            var newMembers = Syntax.List<MemberDeclarationSyntax>(classNode.Members.Concat(new[] { newMethod }));

            var newClass = Syntax.ClassDeclaration(
                classNode.AttributeLists,
                classNode.Modifiers,
                classNode.Keyword,
                classNode.Identifier,
                classNode.TypeParameterList,
                classNode.BaseList,
                classNode.ConstraintClauses,
                classNode.OpenBraceToken,
                newMembers,
                classNode.CloseBraceToken,
                classNode.SemicolonToken).NormalizeWhitespace(elasticTrivia: true);

            root = root.ReplaceNode(classNode, newClass);
            tree = SyntaxTree.Create(root, tree.FilePath, tree.Options);
            Assert.AreEqual(@"class C
{
    void M()
    {
    }

    int NewMethod()
    {
    }
}", tree.GetText().ToString());
        }

        [TestMethod]
        public void DocumentationCommentStructuredTrivia()
        {
            SyntaxTree tree = SyntaxTree.ParseText(@"
/// <summary>
/// Represents a documentation comment e.g. /// &lt;Summary&gt; appearing in
/// source.
/// </summary>
internal sealed partial class DocumentationCommentSyntax
{

}
");

            var root = (CompilationUnitSyntax)tree.GetRoot();
            var comment = root.Members[0].GetLeadingTrivia()[1].GetStructure() as DocumentationCommentTriviaSyntax;

            var interiorXml = comment.GetInteriorXml();
            var expectedXml =
@" <summary> Represents a documentation comment e.g. /// &lt;Summary&gt; appearing in source. </summary>";

            Assert.AreEqual(expectedXml, interiorXml);
        }

        [TestMethod]
        public void WalkTreeUsingSyntaxWalker()
        {
            string text = "class Class { void Method1() { } struct S { } void Method2() { } }";
            SyntaxNode node = Syntax.ParseCompilationUnit(text);
            FileContentsDumper visitor = new FileContentsDumper();
            visitor.Visit(node);
            Assert.AreEqual(@"class Class
  Method1
struct S
  Method2
", visitor.ToString());
        }

        [TestMethod]
        public void TransformTreeUsingSyntaxRewriter()
        {
            string text = "class C { void M() { } int field; }";
            SyntaxTree tree = SyntaxTree.ParseText(text);
            SyntaxNode newRoot = new RemoveMethodsRewriter().Visit(tree.GetRoot());
            Assert.AreEqual("class C { int field; }", newRoot.ToFullString());
        }

        private class RemoveMethodsRewriter : SyntaxRewriter
        {
            public override SyntaxNode VisitMethodDeclaration(MethodDeclarationSyntax node)
            {
                return null;
            }
        }

        private class FileContentsDumper : SyntaxWalker
        {
            private readonly StringBuilder sb = new StringBuilder();

            public override void VisitClassDeclaration(ClassDeclarationSyntax node)
            {
                sb.AppendLine(node.Keyword.ValueText + " " + node.Identifier.ValueText);
                base.VisitClassDeclaration(node);
            }

            public override void VisitStructDeclaration(StructDeclarationSyntax node)
            {
                sb.AppendLine(node.Keyword.ValueText + " " + node.Identifier.ValueText);
                base.VisitStructDeclaration(node);
            }

            public override void VisitInterfaceDeclaration(InterfaceDeclarationSyntax node)
            {
                sb.AppendLine(node.Keyword.ValueText + " " + node.Identifier.ValueText);
                base.VisitInterfaceDeclaration(node);
            }

            public override void VisitMethodDeclaration(MethodDeclarationSyntax node)
            {
                sb.AppendLine("  " + node.Identifier.ToString());
                base.VisitMethodDeclaration(node);
            }

            public override string ToString()
            {
                return sb.ToString();
            }
        }
    }
}
