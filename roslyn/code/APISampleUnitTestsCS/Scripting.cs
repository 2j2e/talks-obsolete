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
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Roslyn.Scripting;
using Roslyn.Scripting.CSharp;

namespace APISampleUnitTestsCS
{
    [TestClass]
    public class Scripting
    {
        [TestMethod]
        public void SimpleEvaluationUsingScriptEngine()
        {
            ScriptEngine engine = new ScriptEngine();
            Session session = engine.CreateSession();
            int result = session.Execute<int>("1 + 2");
            Assert.AreEqual(3, result);
        }

        [TestMethod]
        public void UsingSessionsForMultipleEvaluations()
        {
            ScriptEngine engine = new ScriptEngine();
            Session session = engine.CreateSession();

            session.Execute("int i = 21;");
            int answer = session.Execute<int>("i * 2");

            Assert.AreEqual(42, answer);
        }

        [TestMethod]
        public void ObjectFormatterUsage()
        {
            CommonObjectFormatter formatter = ObjectFormatter.Instance;
            Assert.AreEqual("List<int>(3)", formatter.FormatObject(new List<int> { 1, 2, 3 }));
            Assert.AreEqual("int[2] { Friday, Tuesday }", formatter.FormatObject(new[] { DayOfWeek.Friday, DayOfWeek.Tuesday }));
            Assert.AreEqual("Scripting", formatter.FormatObject(this));
        }
    }
}
