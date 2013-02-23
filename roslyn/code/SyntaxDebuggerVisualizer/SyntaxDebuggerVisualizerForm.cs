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
using System.Drawing;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using Roslyn.Compilers;

namespace Roslyn.Samples.SyntaxVisualizer.Debugger
{
    // A form for displaying the SyntaxTree / SyntaxNode / SyntaxToken / SyntaxTrivia being debugged.
    internal partial class SyntaxDebuggerVisualizerForm : Form
    {
        internal SyntaxDebuggerVisualizerForm()
        {
            InitializeComponent();

            syntaxVisualizer.SyntaxNodeNavigationToSourceRequested += node => NavigateToSource(node.Span);
            syntaxVisualizer.SyntaxTokenNavigationToSourceRequested += token => NavigateToSource(token.Span);
            syntaxVisualizer.SyntaxTriviaNavigationToSourceRequested += trivia => NavigateToSource(trivia.Span);
        }

        // Display deserialized SyntaxTree / SyntaxNode / SyntaxToken / SyntaxTrivia.
        internal void Display(SyntaxTransporter transporter)
        {
            if (transporter != null)
            {
                var node = transporter.GetSyntaxNode();
                const string ErrorMessage =
@"The visualizer failed to correctly serialize / deserialize the
object that you are trying to visualize. The information
currently being displayed in the visualizer may be incorrect.

The root cause could be one of the following -

1. You are trying to visualize a 'top-level' SyntaxToken /
SyntaxTrivia that was generated using Roslyn Syntax Factory
Methods. This is not supported currently.

- OR -

2. There is a bug in Roslyn Syntax APIs that is causing the
serialization / deserialization to fail.";

                if (node == null)
                {
                    HandleError(ErrorMessage);
                }
                else
                {
                    // Populate textbox with source code.
                    codeTextBox.Text = node.ToFullString();

                    // Populate treeview.
                    syntaxVisualizer.DisplaySyntaxNode(node, transporter.SourceLanguage);

                    // In the textbox, select the text corresponding to the SyntaxNode / SyntaxToken /
                    // SyntaxTrivia being debugged.
                    SelectText(transporter.ItemSpan.Start, transporter.ItemSpan.Length);

                    // In the treeview, select the SyntaxNode / SyntaxToken / SyntaxTrivia being debugged.
                    if (!syntaxVisualizer.NavigateToBestMatch(transporter.ItemSpan,
                                                              transporter.ItemKind,
                                                              transporter.ItemCategory,
                                                              highlightMatch: true,
                                                              highlightLegendDescription: "Under Inspection"))
                    {
                        // Display error message if the SyntaxNode / SyntaxToken / SyntaxTrivia
                        // being debugged was not found in the tree.
                        HandleError(ErrorMessage);
                    }
                }
            }
        }

        #region Helpers
        private void SelectText(int spanStart, int spanLength)
        {
            codeTextBox.Select(spanStart, spanLength);
            codeTextBox.ScrollToCaret();
            DisplayPositionInfoBasedOnSelection();
        }

        private void HandleTextSelectionChanged()
        {
            DisplayPositionInfoBasedOnCaret();
            syntaxVisualizer.NavigateToBestMatch(codeTextBox.SelectionStart, codeTextBox.SelectionLength);
        }

        private void DisplayPositionInfoBasedOnSelection()
        {
            DisplayPositionInfo(codeTextBox.SelectionStart);
        }

        [DllImport("user32.dll")]
        private static extern bool GetCaretPos(out Point point);
        private void DisplayPositionInfoBasedOnCaret()
        {
            var point = default(Point);
            if (GetCaretPos(out point))
            {
                var position = codeTextBox.GetCharIndexFromPosition(point);
                DisplayPositionInfo(position);
            }
        }

        private void DisplayPositionInfo(int position)
        {
            lineTextLabel.Visible = true;
            lineValueLabel.Visible = true;
            columnTextLabel.Visible = true;
            columnValueLabel.Visible = true;
            positionTextLabel.Visible = true;
            positionValueLabel.Visible = true;

            // Position is 0-based.
            positionValueLabel.Text = position.ToString();

            var line = codeTextBox.GetLineFromCharIndex(position);
            var column = position - codeTextBox.GetFirstCharIndexFromLine(line);

            // Line and column are 1-based.
            lineValueLabel.Text = (line + 1).ToString();
            columnValueLabel.Text = (column + 1).ToString();
        }

        private void HandleError(string message)
        {
            errorLabel.Visible = true;
            errorLabel.Tag = message;
            DisplayErrorMessageBox(message);
        }

        private void DisplayErrorMessageBox(string message)
        {
            MessageBox.Show(message, "Roslyn Syntax Visualizer - Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        #endregion

        #region Event Handlers
        private void ErrorLabel_MouseHover(object sender, EventArgs e)
        {
            if (errorLabel.Tag != null)
            {
                errorToolTip.Show((string)errorLabel.Tag, toolStrip);
            }
        }

        private void ErrorLabel_Click(object sender, EventArgs e)
        {
            if (errorLabel.Tag != null)
            {
                DisplayErrorMessageBox((string)errorLabel.Tag);
            }
        }

        // When user clicks on a particular item in the treeview select the corresponding text in the textbox.
        private void NavigateToSource(TextSpan span)
        {
            SelectText(span.Start, span.Length);
        }

        // When user selects text in the textbox select the corresponding item in the treeview.
        private void CodeTextBox_KeyUpDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode == Keys.Up || e.KeyCode == Keys.Down ||
                e.KeyCode == Keys.Left || e.KeyCode == Keys.Right ||
                e.KeyCode == Keys.PageUp || e.KeyCode == Keys.PageDown ||
                e.KeyCode == Keys.Home || e.KeyCode == Keys.End)
            {
                HandleTextSelectionChanged();
            }
        }

        // When user selects text in the textbox select the corresponding item in the treeview.
        private void CodeTextBox_MouseUpDownMove(object sender, MouseEventArgs e)
        {
            if (e.Button == MouseButtons.Left)
            {
                HandleTextSelectionChanged();
            }
        }
        #endregion
    }
}
