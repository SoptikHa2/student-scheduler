namespace WinFormsStudentScheduler.Forms
{
    partial class MainWindow
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
            this.UsersListBox = new System.Windows.Forms.ListBox();
            this.NewUserButton = new System.Windows.Forms.Button();
            this.EditUserButton = new System.Windows.Forms.Button();
            this.StartButton = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // UsersListBox
            // 
            this.UsersListBox.FormattingEnabled = true;
            this.UsersListBox.Location = new System.Drawing.Point(12, 12);
            this.UsersListBox.Name = "UsersListBox";
            this.UsersListBox.Size = new System.Drawing.Size(120, 368);
            this.UsersListBox.TabIndex = 0;
            // 
            // NewUserButton
            // 
            this.NewUserButton.Location = new System.Drawing.Point(12, 386);
            this.NewUserButton.Name = "NewUserButton";
            this.NewUserButton.Size = new System.Drawing.Size(57, 23);
            this.NewUserButton.TabIndex = 1;
            this.NewUserButton.Text = "Nový";
            this.NewUserButton.UseVisualStyleBackColor = true;
            this.NewUserButton.Click += new System.EventHandler(this.NewUserButton_Click);
            // 
            // EditUserButton
            // 
            this.EditUserButton.Location = new System.Drawing.Point(75, 386);
            this.EditUserButton.Name = "EditUserButton";
            this.EditUserButton.Size = new System.Drawing.Size(57, 23);
            this.EditUserButton.TabIndex = 2;
            this.EditUserButton.Text = "Upravit";
            this.EditUserButton.UseVisualStyleBackColor = true;
            this.EditUserButton.Click += new System.EventHandler(this.EditUserButton_Click);
            // 
            // StartButton
            // 
            this.StartButton.Location = new System.Drawing.Point(139, 386);
            this.StartButton.Name = "StartButton";
            this.StartButton.Size = new System.Drawing.Size(169, 23);
            this.StartButton.TabIndex = 3;
            this.StartButton.Text = "Spustit program";
            this.StartButton.UseVisualStyleBackColor = true;
            // 
            // MainWindow
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(320, 411);
            this.Controls.Add(this.StartButton);
            this.Controls.Add(this.EditUserButton);
            this.Controls.Add(this.NewUserButton);
            this.Controls.Add(this.UsersListBox);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "MainWindow";
            this.ShowIcon = false;
            this.Text = "Návrhář rozvrhu";
            this.ResumeLayout(false);

        }

        #endregion

        private System.Windows.Forms.ListBox UsersListBox;
        private System.Windows.Forms.Button NewUserButton;
        private System.Windows.Forms.Button EditUserButton;
        private System.Windows.Forms.Button StartButton;
    }
}