using StudentScheduler.AppLogic.NetworkFlow;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace WPFStudentScheduler
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private StackPanel[] daysPanels;
        private Flow flow;

        public MainWindow()
        {
            InitializeComponent();

            // Generate result view
            string[] days = "Pondělí Úterý Středa Čtvrtek Pátek".Split(' ');
            StackPanel container = ResultStackPanel;
            daysPanels = new StackPanel[5];
            for (int i = 0; i < days.Length; i++)
            {
                StackPanel dayContainer = new StackPanel();
                dayContainer.Children.Add(new TextBlock() { FontSize = 25, Text = days[i], TextAlignment = TextAlignment.Center });
                container.Children.Add(dayContainer);
                daysPanels[i] = dayContainer;

                if (i != days.Length - 1)
                    container.Children.Add(new Separator());
            }
        }

        public void InitializeNewStudentDialog()
        {

        }

        #region Event Handlers

        private void AddNewStudentButton_Click(object sender, RoutedEventArgs e) => InitializeNewStudentDialog();

        #endregion
    }
}
