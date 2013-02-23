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
using System.Linq;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

// Roslyn Hosting:
using Roslyn.Compilers;
using Roslyn.Scripting;
using Roslyn.Scripting.CSharp;

namespace ScriptingIntro
{
    public partial class MainWindow : Window
    {
        private HostObjectModel hostObj = null;

        public MainWindow()
        {
            InitializeComponent();
            this.button1.Click += new RoutedEventHandler(this.ButtonClick);
            this.button2.Click += new RoutedEventHandler(this.ButtonClick);

            

            
        }

        // ButtonClick is the handler for all button clicks, and it dispatches to the script function.
        private void ButtonClick(object sender, RoutedEventArgs e)
        {
            var name = ((Button)sender).Name;
            if (hostObj.Commands.ContainsKey(name))
            {
                hostObj.Commands[name]();
            }
            else
            {
                MessageBox.Show("No command implementation for " + name + ".");
            }
        }
    }
}