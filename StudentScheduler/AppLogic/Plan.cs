using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentScheduler.AppLogic
{
    class Plan
    {
        public List<User> students;
        public List<User> teachers;

        public Plan()
        {
            students = new List<User>();
            teachers = new List<User>();
        }

        public object Calc()
        {
            throw new NotImplementedException();
        }
    }
}
