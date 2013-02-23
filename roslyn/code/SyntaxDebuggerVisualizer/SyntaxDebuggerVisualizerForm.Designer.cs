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

namespace Roslyn.Samples.SyntaxVisualizer.Debugger
{
    internal partial class SyntaxDebuggerVisualizerForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }

            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(SyntaxDebuggerVisualizerForm));
            this.splitContainer = new System.Windows.Forms.SplitContainer();
            this.wpfElementHost = new System.Windows.Forms.Integration.ElementHost();
            this.syntaxVisualizer = new Roslyn.Samples.SyntaxVisualizer.Control.SyntaxVisualizerControl();
            this.toolStrip = new System.Windows.Forms.ToolStrip();
            this.positionValueLabel = new System.Windows.Forms.ToolStripLabel();
            this.positionTextLabel = new System.Windows.Forms.ToolStripLabel();
            this.columnValueLabel = new System.Windows.Forms.ToolStripLabel();
            this.columnTextLabel = new System.Windows.Forms.ToolStripLabel();
            this.lineValueLabel = new System.Windows.Forms.ToolStripLabel();
            this.lineTextLabel = new System.Windows.Forms.ToolStripLabel();
            this.errorLabel = new System.Windows.Forms.ToolStripLabel();
            this.codeTextBox = new System.Windows.Forms.TextBox();
            this.errorToolTip = new System.Windows.Forms.ToolTip(this.components);
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer)).BeginInit();
            this.splitContainer.Panel1.SuspendLayout();
            this.splitContainer.Panel2.SuspendLayout();
            this.splitContainer.SuspendLayout();
            this.toolStrip.SuspendLayout();
            this.SuspendLayout();
            // 
            // splitContainer
            // 
            this.splitContainer.Dock = System.Windows.Forms.DockStyle.Fill;
            this.splitContainer.Location = new System.Drawing.Point(0, 0);
            this.splitContainer.Name = "splitContainer";
            // 
            // splitContainer.Panel1
            // 
            this.splitContainer.Panel1.Controls.Add(this.wpfElementHost);
            this.splitContainer.Panel1MinSize = 300;
            // 
            // splitContainer.Panel2
            // 
            this.splitContainer.Panel2.Controls.Add(this.toolStrip);
            this.splitContainer.Panel2.Controls.Add(this.codeTextBox);
            this.splitContainer.Panel2.Padding = new System.Windows.Forms.Padding(5);
            this.splitContainer.Panel2MinSize = 600;
            this.splitContainer.Size = new System.Drawing.Size(947, 602);
            this.splitContainer.SplitterDistance = 300;
            this.splitContainer.TabIndex = 0;
            // 
            // wpfElementHost
            // 
            this.wpfElementHost.Dock = System.Windows.Forms.DockStyle.Fill;
            this.wpfElementHost.Location = new System.Drawing.Point(0, 0);
            this.wpfElementHost.Name = "wpfElementHost";
            this.wpfElementHost.Size = new System.Drawing.Size(300, 602);
            this.wpfElementHost.TabIndex = 0;
            this.wpfElementHost.Text = "elementHost1";
            this.wpfElementHost.Child = this.syntaxVisualizer;
            // 
            // toolStrip
            // 
            this.toolStrip.GripStyle = System.Windows.Forms.ToolStripGripStyle.Hidden;
            this.toolStrip.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.positionValueLabel,
            this.positionTextLabel,
            this.columnValueLabel,
            this.columnTextLabel,
            this.lineValueLabel,
            this.lineTextLabel,
            this.errorLabel});
            this.toolStrip.Location = new System.Drawing.Point(5, 5);
            this.toolStrip.Name = "toolStrip";
            this.toolStrip.RenderMode = System.Windows.Forms.ToolStripRenderMode.System;
            this.toolStrip.Size = new System.Drawing.Size(633, 25);
            this.toolStrip.TabIndex = 0;
            // 
            // positionValueLabel
            // 
            this.positionValueLabel.Alignment = System.Windows.Forms.ToolStripItemAlignment.Right;
            this.positionValueLabel.Margin = new System.Windows.Forms.Padding(0, 1, 17, 2);
            this.positionValueLabel.Name = "positionValueLabel";
            this.positionValueLabel.Size = new System.Drawing.Size(0, 22);
            this.positionValueLabel.Visible = false;
            // 
            // positionTextLabel
            // 
            this.positionTextLabel.Alignment = System.Windows.Forms.ToolStripItemAlignment.Right;
            this.positionTextLabel.Margin = new System.Windows.Forms.Padding(15, 1, 0, 2);
            this.positionTextLabel.Name = "positionTextLabel";
            this.positionTextLabel.Size = new System.Drawing.Size(50, 22);
            this.positionTextLabel.Text = "Position";
            this.positionTextLabel.Visible = false;
            // 
            // columnValueLabel
            // 
            this.columnValueLabel.Alignment = System.Windows.Forms.ToolStripItemAlignment.Right;
            this.columnValueLabel.Name = "columnValueLabel";
            this.columnValueLabel.Size = new System.Drawing.Size(0, 22);
            this.columnValueLabel.Visible = false;
            // 
            // columnTextLabel
            // 
            this.columnTextLabel.Alignment = System.Windows.Forms.ToolStripItemAlignment.Right;
            this.columnTextLabel.Margin = new System.Windows.Forms.Padding(15, 1, 0, 2);
            this.columnTextLabel.Name = "columnTextLabel";
            this.columnTextLabel.Size = new System.Drawing.Size(50, 22);
            this.columnTextLabel.Text = "Column";
            this.columnTextLabel.Visible = false;
            // 
            // lineValueLabel
            // 
            this.lineValueLabel.Alignment = System.Windows.Forms.ToolStripItemAlignment.Right;
            this.lineValueLabel.Name = "lineValueLabel";
            this.lineValueLabel.Size = new System.Drawing.Size(0, 22);
            this.lineValueLabel.Visible = false;
            // 
            // lineTextLabel
            // 
            this.lineTextLabel.Alignment = System.Windows.Forms.ToolStripItemAlignment.Right;
            this.lineTextLabel.Name = "lineTextLabel";
            this.lineTextLabel.Size = new System.Drawing.Size(29, 22);
            this.lineTextLabel.Text = "Line";
            this.lineTextLabel.Visible = false;
            // 
            // errorLabel
            // 
            this.errorLabel.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.errorLabel.Image = ((System.Drawing.Image)(resources.GetObject("errorLabel.Image")));
            this.errorLabel.IsLink = true;
            this.errorLabel.Name = "errorLabel";
            this.errorLabel.Size = new System.Drawing.Size(51, 22);
            this.errorLabel.Text = "Error";
            this.errorLabel.Visible = false;
            this.errorLabel.Click += new System.EventHandler(this.ErrorLabel_Click);
            this.errorLabel.MouseHover += new System.EventHandler(this.ErrorLabel_MouseHover);
            // 
            // codeTextBox
            // 
            this.codeTextBox.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.codeTextBox.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.codeTextBox.Font = new System.Drawing.Font("Consolas", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.codeTextBox.HideSelection = false;
            this.codeTextBox.Location = new System.Drawing.Point(5, 35);
            this.codeTextBox.Multiline = true;
            this.codeTextBox.Name = "codeTextBox";
            this.codeTextBox.ReadOnly = true;
            this.codeTextBox.ScrollBars = System.Windows.Forms.ScrollBars.Both;
            this.codeTextBox.Size = new System.Drawing.Size(633, 564);
            this.codeTextBox.TabIndex = 1;
            this.codeTextBox.WordWrap = false;
            this.codeTextBox.KeyDown += new System.Windows.Forms.KeyEventHandler(this.CodeTextBox_KeyUpDown);
            this.codeTextBox.KeyUp += new System.Windows.Forms.KeyEventHandler(this.CodeTextBox_KeyUpDown);
            this.codeTextBox.MouseDown += new System.Windows.Forms.MouseEventHandler(this.CodeTextBox_MouseUpDownMove);
            this.codeTextBox.MouseMove += new System.Windows.Forms.MouseEventHandler(this.CodeTextBox_MouseUpDownMove);
            this.codeTextBox.MouseUp += new System.Windows.Forms.MouseEventHandler(this.CodeTextBox_MouseUpDownMove);
            // 
            // errorToolTip
            // 
            this.errorToolTip.ToolTipIcon = System.Windows.Forms.ToolTipIcon.Error;
            this.errorToolTip.ToolTipTitle = "Roslyn Syntax Visualizer - Error";
            // 
            // SyntaxDebuggerVisualizerForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(947, 602);
            this.Controls.Add(this.splitContainer);
            this.DoubleBuffered = true;
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.MinimumSize = new System.Drawing.Size(963, 640);
            this.Name = "SyntaxDebuggerVisualizerForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterParent;
            this.Text = "Roslyn Syntax Visualizer";
            this.splitContainer.Panel1.ResumeLayout(false);
            this.splitContainer.Panel2.ResumeLayout(false);
            this.splitContainer.Panel2.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer)).EndInit();
            this.splitContainer.ResumeLayout(false);
            this.toolStrip.ResumeLayout(false);
            this.toolStrip.PerformLayout();
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.Integration.ElementHost wpfElementHost;
        private SyntaxVisualizer.Control.SyntaxVisualizerControl syntaxVisualizer;
        private System.Windows.Forms.SplitContainer splitContainer;
        private System.Windows.Forms.TextBox codeTextBox;
        private System.Windows.Forms.ToolTip errorToolTip;
        private System.Windows.Forms.ToolStrip toolStrip;
        private System.Windows.Forms.ToolStripLabel lineTextLabel;
        private System.Windows.Forms.ToolStripLabel lineValueLabel;
        private System.Windows.Forms.ToolStripLabel columnTextLabel;
        private System.Windows.Forms.ToolStripLabel columnValueLabel;
        private System.Windows.Forms.ToolStripLabel positionTextLabel;
        private System.Windows.Forms.ToolStripLabel positionValueLabel;
        private System.Windows.Forms.ToolStripLabel errorLabel;
    }
}