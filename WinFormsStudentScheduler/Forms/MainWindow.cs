using StudentScheduler.AppLogic;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace WinFormsStudentScheduler.Forms
{
    public partial class MainWindow : Form
    {
        public MainWindow()
        {
            InitializeComponent();

            UsersListBox.Items.Add(new User("Učitel", new bool[5], new int[5], new int[5]));
        }

        private void NewUserButton_Click(object sender, EventArgs e)
        {
            var dialog = new EditUserDialog();

            if(dialog.ShowDialog() == DialogResult.OK)
            {
                UsersListBox.Items.Add(dialog.Result);
            }
        }

        private void EditUserButton_Click(object sender, EventArgs e)
        {
            if (UsersListBox.SelectedItem == null)
                return;

            var dialog = new EditUserDialog(UsersListBox.SelectedItem as User);

            if(dialog.ShowDialog() == DialogResult.OK)
            {
                UsersListBox.Items[UsersListBox.SelectedIndex] = dialog.Result;
            }
        }
    }
}
