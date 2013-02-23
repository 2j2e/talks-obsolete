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
using System.Windows.Media;

namespace ScriptingIntro
{
    // HostObjectModel is the type of object we put in the Interactive Session for script code.
    // Script code binds free identifiers to public members on this type.
    public class HostObjectModel
    {
        // Need to create the host object model instance with the WPF main window so that we can
        // call back on it from script code.
        private MainWindow mainWindow = null;

        public HostObjectModel(MainWindow window)
        {
            this.mainWindow = window;
        }

        // BackgroundColor is an example of host functionality exposed to script code.  The host
        // could just expose main window and let script code party all over the main window, or the
        // host can expose functionality selectively.
        public Color BackgroundColor
        {
            get { return ((SolidColorBrush)this.mainWindow.Background).Color; }
            set { mainWindow.Background = new SolidColorBrush(value); }
        }

        // Commands holds a dictionary of named commands.  Script code can add commands to the hot
        // application.  The host can invoke commands attached to buttons via name lookup.
        internal Dictionary<string, Action> Commands = new Dictionary<string, Action>();

        public void AddCommand(string name, Action commandImplementation)
        {
            Commands[name] = commandImplementation;
        }
    }
}