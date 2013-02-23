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
using System.Globalization;
using System.IO;
using System.Linq;
using System.Reflection;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Roslyn.Compilers;
using Roslyn.Compilers.CSharp;

namespace APISampleUnitTestsCS
{
    [TestClass]
    public class Compilations
    {
        [TestMethod]
        public void EndToEndCompileAndRun()
        {
            var expression = "6 * 7";
            var text = @"public class Calculator
{
    public static object Evaluate()
    {
        return $;
    } 
}".Replace("$", expression);

            var tree = SyntaxTree.ParseText(text);
            var compilation = Compilation.Create(
                "calc.dll",
                options: new CompilationOptions(OutputKind.DynamicallyLinkedLibrary),
                syntaxTrees: new[] { tree },
                references: new[] { new MetadataFileReference(typeof(object).Assembly.Location) });

            Assembly compiledAssembly;
            using (var stream = new MemoryStream())
            {
                EmitResult compileResult = compilation.Emit(stream);
                compiledAssembly = Assembly.Load(stream.GetBuffer());
            }

            Type calculator = compiledAssembly.GetType("Calculator");
            MethodInfo evaluate = calculator.GetMethod("Evaluate");
            string answer = evaluate.Invoke(null, null).ToString();

            Assert.AreEqual("42", answer);
        }

        [TestMethod]
        public void GetErrorsAndWarnings()
        {
            string text = @"class Program
{
    static int Main(string[] args)
    {
    }
}";

            SyntaxTree tree = SyntaxTree.ParseText(text);
            Compilation compilation = Compilation
                .Create("program.exe")
                .AddSyntaxTrees(tree)
                .AddReferences(new MetadataFileReference(typeof(object).Assembly.Location));

            IEnumerable<Diagnostic> errorsAndWarnings = compilation.GetDiagnostics();
            Assert.AreEqual(1, errorsAndWarnings.Count());

            Diagnostic error = errorsAndWarnings.First();
            Assert.AreEqual(
                "'Program.Main(string[])': not all code paths return a value",
                error.Info.GetMessage(CultureInfo.InvariantCulture));

            Location errorLocation = error.Location;
            Assert.AreEqual(4, error.Location.SourceSpan.Length);

            IText programText = errorLocation.SourceTree.GetText();
            Assert.AreEqual("Main", programText.ToString(errorLocation.SourceSpan));

            FileLinePositionSpan span = error.Location.GetLineSpan(usePreprocessorDirectives: true);
            Assert.AreEqual(15, span.StartLinePosition.Character);
            Assert.AreEqual(2, span.StartLinePosition.Line);
        }
    }
}
