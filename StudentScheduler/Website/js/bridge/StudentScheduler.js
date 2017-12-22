/**
 * @version 1.0.0.0
 * @copyright Copyright ©  2017
 * @compiler Bridge.NET 16.5.0
 */
Bridge.assembly("StudentScheduler", function ($asm, globals) {
    "use strict";

    Bridge.define("StudentScheduler.App", {
        main: function Main () {

            // TODO: load?
            StudentScheduler.App.plan = new StudentScheduler.AppLogic.Plan();

            // Register callbacks
            var butNewTeacher = StudentScheduler.App.Gid("add-teacher");
            butNewTeacher.onclick = Bridge.fn.combine(butNewTeacher.onclick, function (e) {
                StudentScheduler.App.AddNewTeacher(butNewTeacher);
            });
            var butNewStudent = StudentScheduler.App.Gid("add-student");
            butNewStudent.onclick = Bridge.fn.combine(butNewStudent.onclick, function (e) {
                StudentScheduler.App.AddNewStudent(butNewStudent);
            });

            var buts = StudentScheduler.App.Gcl("teacher-click");
            for (var i = 0; i < buts.length; i = (i + 1) | 0) {
                buts[System.Array.index(i, buts)].onclick = Bridge.fn.combine(buts[System.Array.index(i, buts)].onclick, function (e) {
                    StudentScheduler.App.EditHoursClick(buts[System.Array.index(i, buts)], true);
                });
            }

            buts = StudentScheduler.App.Gcl("student-click");
            for (var i1 = 0; i1 < buts.length; i1 = (i1 + 1) | 0) {
                buts[System.Array.index(i1, buts)].onclick = Bridge.fn.combine(buts[System.Array.index(i1, buts)].onclick, function (e) {
                    StudentScheduler.App.EditHoursClick(buts[System.Array.index(i1, buts)], false);
                });
            }
        },
        statics: {
            fields: {
                plan: null,
                lastSetWasTeacher: false,
                lastSetId: 0
            },
            methods: {
                AddNewTeacher: function (sender) {
                    // Get name input and it's value
                    var input = (Bridge.as(System.Linq.Enumerable.from(sender.parentElement.parentElement.getElementsByClassName("form-group")[0].children).where(function (x) {
                            return Bridge.referenceEquals(x.id, ("teacher-name"));
                        }).first(), HTMLInputElement));
                    var newTeacherName = input.value;
                    if (Bridge.referenceEquals(newTeacherName, "")) {
                        return;
                    }

                    StudentScheduler.App.plan.teachers.add(new StudentScheduler.AppLogic.User(newTeacherName, System.Array.init(5, false, System.Boolean), System.Array.init(5, 0, System.Int32), System.Array.init(5, 0, System.Int32)));
                    var div = StudentScheduler.App.Gid("teachers");

                    var card = document.createElement("div");
                    card.className = "card card-body";
                    card.innerHTML = (card.innerHTML || "") + (("<p><strong>" + (newTeacherName || "") + "</strong></p>") || "");
                    var setHours = document.createElement("button");
                    setHours.name = (((StudentScheduler.App.plan.teachers.Count - 1) | 0)).toString();
                    setHours.className = "btn btn-primary teacher-click";
                    setHours.setAttribute("data-toggle", "modal");
                    setHours.setAttribute("data-target", "#setHoursModal");
                    setHours.innerHTML = "Nastavit hodiny";
                    setHours.onclick = Bridge.fn.combine(setHours.onclick, function (e) {
                        StudentScheduler.App.EditHoursClick(setHours, true);
                    });
                    card.appendChild(setHours);
                    div.appendChild(card);

                    input.value = "";
                },
                AddNewStudent: function (sender) {
                    // Get name input and it's value
                    var input = (Bridge.as(System.Linq.Enumerable.from(sender.parentElement.parentElement.getElementsByClassName("form-group")[0].children).where(function (x) {
                            return Bridge.referenceEquals(x.id, ("student-name"));
                        }).first(), HTMLInputElement));
                    var newStudentName = input.value;
                    if (Bridge.referenceEquals(newStudentName, "")) {
                        return;
                    }

                    StudentScheduler.App.plan.students.add(new StudentScheduler.AppLogic.User(newStudentName, System.Array.init(5, false, System.Boolean), System.Array.init(5, 0, System.Int32), System.Array.init(5, 0, System.Int32)));
                    var div = StudentScheduler.App.Gid("students");

                    var card = document.createElement("div");
                    card.className = "card card-body";
                    card.innerHTML = (card.innerHTML || "") + (("<p><strong>" + (newStudentName || "") + "</strong></p>") || "");
                    var setHours = document.createElement("button");
                    setHours.name = (((StudentScheduler.App.plan.teachers.Count - 1) | 0)).toString();
                    setHours.className = "btn btn-primary teacher-click";
                    setHours.setAttribute("data-toggle", "modal");
                    setHours.setAttribute("data-target", "#setHoursModal");
                    setHours.innerHTML = "Nastavit hodiny";
                    setHours.onclick = Bridge.fn.combine(setHours.onclick, function (e) {
                        StudentScheduler.App.EditHoursClick(setHours, true);
                    });
                    card.appendChild(setHours);
                    div.appendChild(card);

                    input.value = "";
                },
                EditHoursClick: function (sender, wasTeacher) {
                    StudentScheduler.App.lastSetWasTeacher = wasTeacher;
                    StudentScheduler.App.lastSetId = System.Int32.parse((Bridge.as(sender, HTMLElement)).getAttribute("name"));
                    var selectedCollection = (wasTeacher ? StudentScheduler.App.plan.teachers : StudentScheduler.App.plan.students);

                    StudentScheduler.App.Gid("set-time-monday").innerHTML = selectedCollection.getItem(StudentScheduler.App.lastSetId).GetHoursInDay(0);
                    StudentScheduler.App.Gid("set-time-tuesday").innerHTML = selectedCollection.getItem(StudentScheduler.App.lastSetId).GetHoursInDay(1);
                    StudentScheduler.App.Gid("set-time-wednesday").innerHTML = selectedCollection.getItem(StudentScheduler.App.lastSetId).GetHoursInDay(2);
                    StudentScheduler.App.Gid("set-time-thursday").innerHTML = selectedCollection.getItem(StudentScheduler.App.lastSetId).GetHoursInDay(3);
                    StudentScheduler.App.Gid("set-time-friday").innerHTML = selectedCollection.getItem(StudentScheduler.App.lastSetId).GetHoursInDay(4);

                    StudentScheduler.App.Gid("setTimeModalInfoText").innerHTML = "V tento den má " + (selectedCollection.getItem(StudentScheduler.App.lastSetId).name || "") + " čas";
                },
                Gid: function (id) {
                    return document.getElementById(id);
                },
                Gcl: function (cls) {
                    return System.Linq.Enumerable.from(document.body.getElementsByClassName(cls)).toArray();
                }
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.Plan", {
        fields: {
            students: null,
            teachers: null
        },
        ctors: {
            ctor: function () {
                this.$initialize();
                this.students = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.User)).ctor();
                this.teachers = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.User)).ctor();
            }
        },
        methods: {
            Calc: function () {
                throw new System.NotImplementedException();
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.User", {
        statics: {
            fields: {
                hourLength: 0
            },
            ctors: {
                init: function () {
                    this.hourLength = 45;
                }
            }
        },
        fields: {
            name: null,
            daysAvailable: null,
            minutesFromAvailable: null,
            minutesToAvailable: null,
            assignedConvertedMinutesFrom: 0
        },
        ctors: {
            ctor: function (name, daysAvailable, minutesFromAvailable, minutesToAvailable) {
                this.$initialize();
                this.name = name;
                this.daysAvailable = daysAvailable;
                this.minutesFromAvailable = minutesFromAvailable;
                this.minutesToAvailable = minutesToAvailable;
                this.assignedConvertedMinutesFrom = -1;
            }
        },
        methods: {
            GetHoursInDay: function (dayIndex) {
                if (dayIndex < 0 || dayIndex >= 5) {
                    throw new System.ArgumentException("Parameter MUST BE in range [0; 5). Value: " + dayIndex, "dayIndex");
                }

                if (!this.daysAvailable[System.Array.index(dayIndex, this.daysAvailable)]) {
                    return "Není nastaveno";
                }

                var minutesF = this.minutesFromAvailable[System.Array.index(dayIndex, this.minutesFromAvailable)];
                var minutesT = this.minutesToAvailable[System.Array.index(dayIndex, this.minutesToAvailable)];

                var hoursF = Bridge.Int.clip32(Math.floor(minutesF / 60.0));
                var hoursT = Bridge.Int.clip32(Math.floor(minutesT / 60.0));

                return System.String.format("Od {0}:{1} do {2}:{3}", Bridge.box(hoursF, System.Int32), System.Int32.format((((minutesF - Bridge.Int.mul(hoursF, 60)) | 0)), "###"), Bridge.box(hoursT, System.Int32), System.Int32.format((((minutesT - Bridge.Int.mul(hoursT, 60)) | 0)), "##"));
            }
        }
    });
});

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJTdHVkZW50U2NoZWR1bGVyLmpzIiwKICAic291cmNlUm9vdCI6ICIiLAogICJzb3VyY2VzIjogWyJBcHBMb2dpYy9BcHAuY3MiLCJBcHBMb2dpYy9QbGFuLmNzIiwiQXBwTG9naWMvVXNlci5jcyJdLAogICJuYW1lcyI6IFsiIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7O1lBb0JZQSw0QkFBT0EsSUFBSUE7OztZQUdYQSxvQkFBb0JBO1lBQ3BCQSxpRUFBeUJBLFVBQUNBO2dCQUFRQSxtQ0FBY0E7O1lBQ2hEQSxvQkFBb0JBO1lBQ3BCQSxpRUFBeUJBLFVBQUNBO2dCQUFRQSxtQ0FBY0E7OztZQUVoREEsV0FBV0E7WUFDWEEsS0FBS0EsV0FBV0EsSUFBSUEsYUFBYUE7Z0JBQzdCQSx3QkFBS0EsR0FBTEEsMkRBQUtBLEdBQUxBLGdCQUFtQkEsVUFBQ0E7b0JBQVFBLG9DQUFlQSx3QkFBS0EsR0FBTEE7Ozs7WUFFL0NBLE9BQU9BO1lBQ1BBLEtBQUtBLFlBQVdBLEtBQUlBLGFBQWFBO2dCQUM3QkEsd0JBQUtBLElBQUxBLDJEQUFLQSxJQUFMQSxnQkFBbUJBLFVBQUNBO29CQUFRQSxvQ0FBZUEsd0JBQUtBLElBQUxBOzs7Ozs7Ozs7Ozt5Q0FHakJBOztvQkFHOUJBLFlBQXlCQSxDQUFDQSxzQ0FBK0RBLDJGQUFvRkEsQUFBOERBO21DQUFLQSw2QkFBUUE7O29CQUN4UEEscUJBQXdCQTtvQkFDeEJBLElBQUlBO3dCQUNBQTs7O29CQUVKQSx1Q0FBa0JBLElBQUlBLCtCQUFLQSxnQkFBZ0JBLDZDQUFhQSx1Q0FBWUE7b0JBQ3BFQSxVQUFrQkE7O29CQUVsQkEsV0FBc0JBO29CQUN0QkE7b0JBQ0FBLDJDQUFrQkEsa0JBQWdCQTtvQkFDbENBLGVBQTZCQTtvQkFDN0JBLGdCQUFnQkEsQ0FBQ0E7b0JBQ2pCQTtvQkFDQUE7b0JBQ0FBO29CQUNBQTtvQkFDQUEsdURBQW9CQSxVQUFDQTt3QkFBUUEsb0NBQWVBOztvQkFDNUNBLGlCQUFpQkE7b0JBQ2pCQSxnQkFBZ0JBOztvQkFFaEJBOzt5Q0FHOEJBOztvQkFHOUJBLFlBQXlCQSxDQUFDQSxzQ0FBK0RBLDJGQUFvRkEsQUFBOERBO21DQUFLQSw2QkFBUUE7O29CQUN4UEEscUJBQXdCQTtvQkFDeEJBLElBQUlBO3dCQUNBQTs7O29CQUVKQSx1Q0FBa0JBLElBQUlBLCtCQUFLQSxnQkFBZ0JBLDZDQUFhQSx1Q0FBWUE7b0JBQ3BFQSxVQUFrQkE7O29CQUVsQkEsV0FBc0JBO29CQUN0QkE7b0JBQ0FBLDJDQUFrQkEsa0JBQWdCQTtvQkFDbENBLGVBQTZCQTtvQkFDN0JBLGdCQUFnQkEsQ0FBQ0E7b0JBQ2pCQTtvQkFDQUE7b0JBQ0FBO29CQUNBQTtvQkFDQUEsdURBQW9CQSxVQUFDQTt3QkFBUUEsb0NBQWVBOztvQkFDNUNBLGlCQUFpQkE7b0JBQ2pCQSxnQkFBZ0JBOztvQkFFaEJBOzswQ0FHK0JBLFFBQWVBO29CQUU5Q0EseUNBQW9CQTtvQkFDcEJBLGlDQUFZQSxtQkFBVUEsQ0FBQ0E7b0JBQ3ZCQSx5QkFBZ0NBLENBQUNBLGFBQWFBLHFDQUFnQkE7O29CQUU5REEsd0RBQW1DQSwyQkFBbUJBO29CQUN0REEseURBQW9DQSwyQkFBbUJBO29CQUN2REEsMkRBQXNDQSwyQkFBbUJBO29CQUN6REEsMERBQXFDQSwyQkFBbUJBO29CQUN4REEsd0RBQW1DQSwyQkFBbUJBOztvQkFFdERBLDZEQUF3Q0EscUJBQW9CQSwyQkFBbUJBOzsrQkFNcERBO29CQUFZQSxPQUFPQSx3QkFBd0JBOzsrQkFDekNBO29CQUFhQSxPQUFPQSw0QkFBaUVBLHFDQUFxQ0E7Ozs7Ozs7Ozs7Ozs7O2dCQy9GdkpBLGdCQUFXQSxLQUFJQTtnQkFDZkEsZ0JBQVdBLEtBQUlBOzs7OztnQkFLZkEsTUFBTUEsSUFBSUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkNIRkEsTUFBYUEsZUFBc0JBLHNCQUE0QkE7O2dCQUV2RUEsWUFBWUE7Z0JBQ1pBLHFCQUFxQkE7Z0JBQ3JCQSw0QkFBNEJBO2dCQUM1QkEsMEJBQTBCQTtnQkFDMUJBLG9DQUErQkE7Ozs7cUNBR1BBO2dCQUV4QkEsSUFBSUEsZ0JBQWdCQTtvQkFDaEJBLE1BQU1BLElBQUlBLHlCQUFrQkEsK0NBQStDQTs7O2dCQUUvRUEsSUFBSUEsQ0FBQ0Esc0NBQWNBLFVBQWRBO29CQUNEQTs7O2dCQUVKQSxlQUFlQSw2Q0FBcUJBLFVBQXJCQTtnQkFDZkEsZUFBZUEsMkNBQW1CQSxVQUFuQkE7O2dCQUVmQSxhQUFhQSxrQkFBS0EsV0FBV0E7Z0JBQzdCQSxhQUFhQSxrQkFBS0EsV0FBV0E7O2dCQUU3QkEsT0FBT0EsOENBQXNDQSxrQ0FBT0EscUJBQUNBLGFBQVdBLDJDQUE2QkEsa0NBQU9BLHFCQUFDQSxhQUFXQSIsCiAgInNvdXJjZXNDb250ZW50IjogWyJ1c2luZyBCcmlkZ2U7XHJcbnVzaW5nIEJyaWRnZS5IdG1sNTtcclxudXNpbmcgTmV3dG9uc29mdC5Kc29uO1xyXG51c2luZyBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljO1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBBcHBcclxuICAgIHtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBQbGFuIHBsYW47XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgYm9vbCBsYXN0U2V0V2FzVGVhY2hlcjtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpbnQgbGFzdFNldElkO1xyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHZvaWQgTWFpbigpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgLy8gVE9ETzogbG9hZD9cclxuICAgICAgICAgICAgcGxhbiA9IG5ldyBQbGFuKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZWdpc3RlciBjYWxsYmFja3NcclxuICAgICAgICAgICAgdmFyIGJ1dE5ld1RlYWNoZXIgPSBHaWQoXCJhZGQtdGVhY2hlclwiKTtcclxuICAgICAgICAgICAgYnV0TmV3VGVhY2hlci5PbkNsaWNrICs9IChlKSA9PiB7IEFkZE5ld1RlYWNoZXIoYnV0TmV3VGVhY2hlcik7IH07XHJcbiAgICAgICAgICAgIHZhciBidXROZXdTdHVkZW50ID0gR2lkKFwiYWRkLXN0dWRlbnRcIik7XHJcbiAgICAgICAgICAgIGJ1dE5ld1N0dWRlbnQuT25DbGljayArPSAoZSkgPT4geyBBZGROZXdTdHVkZW50KGJ1dE5ld1N0dWRlbnQpOyB9O1xyXG5cclxuICAgICAgICAgICAgdmFyIGJ1dHMgPSBHY2woXCJ0ZWFjaGVyLWNsaWNrXCIpO1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGJ1dHMuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgICAgICBidXRzW2ldLk9uQ2xpY2sgKz0gKGUpID0+IHsgRWRpdEhvdXJzQ2xpY2soYnV0c1tpXSwgdHJ1ZSk7IH07XHJcblxyXG4gICAgICAgICAgICBidXRzID0gR2NsKFwic3R1ZGVudC1jbGlja1wiKTtcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBidXRzLkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICAgICAgYnV0c1tpXS5PbkNsaWNrICs9IChlKSA9PiB7IEVkaXRIb3Vyc0NsaWNrKGJ1dHNbaV0sIGZhbHNlKTsgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgQWRkTmV3VGVhY2hlcihIVE1MRWxlbWVudCBzZW5kZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBHZXQgbmFtZSBpbnB1dCBhbmQgaXQncyB2YWx1ZVxyXG4gICAgICAgICAgICBIVE1MSW5wdXRFbGVtZW50IGlucHV0ID0gKFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpCcmlkZ2UuSHRtbDUuSFRNTEVsZW1lbnQ+KHNlbmRlci5QYXJlbnRFbGVtZW50LlBhcmVudEVsZW1lbnQuR2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImZvcm0tZ3JvdXBcIilbMF0uQ2hpbGRyZW4sKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpCcmlkZ2UuSHRtbDUuSFRNTEVsZW1lbnQsIGJvb2w+KSh4ID0+IHguSWQgPT0gKFwidGVhY2hlci1uYW1lXCIpKSkuRmlyc3QoKSBhcyBIVE1MSW5wdXRFbGVtZW50KTtcclxuICAgICAgICAgICAgc3RyaW5nIG5ld1RlYWNoZXJOYW1lID0gaW5wdXQuVmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChuZXdUZWFjaGVyTmFtZSA9PSBcIlwiKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgcGxhbi50ZWFjaGVycy5BZGQobmV3IFVzZXIobmV3VGVhY2hlck5hbWUsIG5ldyBib29sWzVdLCBuZXcgaW50WzVdLCBuZXcgaW50WzVdKSk7XHJcbiAgICAgICAgICAgIEhUTUxFbGVtZW50IGRpdiA9IEdpZChcInRlYWNoZXJzXCIpO1xyXG5cclxuICAgICAgICAgICAgSFRNTERpdkVsZW1lbnQgY2FyZCA9IG5ldyBIVE1MRGl2RWxlbWVudCgpO1xyXG4gICAgICAgICAgICBjYXJkLkNsYXNzTmFtZSA9IFwiY2FyZCBjYXJkLWJvZHlcIjtcclxuICAgICAgICAgICAgY2FyZC5Jbm5lckhUTUwgKz0gXCI8cD48c3Ryb25nPlwiICsgbmV3VGVhY2hlck5hbWUgKyBcIjwvc3Ryb25nPjwvcD5cIjtcclxuICAgICAgICAgICAgSFRNTEJ1dHRvbkVsZW1lbnQgc2V0SG91cnMgPSBuZXcgSFRNTEJ1dHRvbkVsZW1lbnQoKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuTmFtZSA9IChwbGFuLnRlYWNoZXJzLkNvdW50IC0gMSkuVG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuQ2xhc3NOYW1lID0gXCJidG4gYnRuLXByaW1hcnkgdGVhY2hlci1jbGlja1wiO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5TZXRBdHRyaWJ1dGUoXCJkYXRhLXRvZ2dsZVwiLCBcIm1vZGFsXCIpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5TZXRBdHRyaWJ1dGUoXCJkYXRhLXRhcmdldFwiLCBcIiNzZXRIb3Vyc01vZGFsXCIpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5Jbm5lckhUTUwgPSBcIk5hc3Rhdml0IGhvZGlueVwiO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5PbkNsaWNrICs9IChlKSA9PiB7IEVkaXRIb3Vyc0NsaWNrKHNldEhvdXJzLCB0cnVlKTsgfTtcclxuICAgICAgICAgICAgY2FyZC5BcHBlbmRDaGlsZChzZXRIb3Vycyk7XHJcbiAgICAgICAgICAgIGRpdi5BcHBlbmRDaGlsZChjYXJkKTtcclxuXHJcbiAgICAgICAgICAgIGlucHV0LlZhbHVlID0gXCJcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgQWRkTmV3U3R1ZGVudChIVE1MRWxlbWVudCBzZW5kZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBHZXQgbmFtZSBpbnB1dCBhbmQgaXQncyB2YWx1ZVxyXG4gICAgICAgICAgICBIVE1MSW5wdXRFbGVtZW50IGlucHV0ID0gKFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpCcmlkZ2UuSHRtbDUuSFRNTEVsZW1lbnQ+KHNlbmRlci5QYXJlbnRFbGVtZW50LlBhcmVudEVsZW1lbnQuR2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImZvcm0tZ3JvdXBcIilbMF0uQ2hpbGRyZW4sKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpCcmlkZ2UuSHRtbDUuSFRNTEVsZW1lbnQsIGJvb2w+KSh4ID0+IHguSWQgPT0gKFwic3R1ZGVudC1uYW1lXCIpKSkuRmlyc3QoKSBhcyBIVE1MSW5wdXRFbGVtZW50KTtcclxuICAgICAgICAgICAgc3RyaW5nIG5ld1N0dWRlbnROYW1lID0gaW5wdXQuVmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChuZXdTdHVkZW50TmFtZSA9PSBcIlwiKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgcGxhbi5zdHVkZW50cy5BZGQobmV3IFVzZXIobmV3U3R1ZGVudE5hbWUsIG5ldyBib29sWzVdLCBuZXcgaW50WzVdLCBuZXcgaW50WzVdKSk7XHJcbiAgICAgICAgICAgIEhUTUxFbGVtZW50IGRpdiA9IEdpZChcInN0dWRlbnRzXCIpO1xyXG5cclxuICAgICAgICAgICAgSFRNTERpdkVsZW1lbnQgY2FyZCA9IG5ldyBIVE1MRGl2RWxlbWVudCgpO1xyXG4gICAgICAgICAgICBjYXJkLkNsYXNzTmFtZSA9IFwiY2FyZCBjYXJkLWJvZHlcIjtcclxuICAgICAgICAgICAgY2FyZC5Jbm5lckhUTUwgKz0gXCI8cD48c3Ryb25nPlwiICsgbmV3U3R1ZGVudE5hbWUgKyBcIjwvc3Ryb25nPjwvcD5cIjtcclxuICAgICAgICAgICAgSFRNTEJ1dHRvbkVsZW1lbnQgc2V0SG91cnMgPSBuZXcgSFRNTEJ1dHRvbkVsZW1lbnQoKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuTmFtZSA9IChwbGFuLnRlYWNoZXJzLkNvdW50IC0gMSkuVG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuQ2xhc3NOYW1lID0gXCJidG4gYnRuLXByaW1hcnkgdGVhY2hlci1jbGlja1wiO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5TZXRBdHRyaWJ1dGUoXCJkYXRhLXRvZ2dsZVwiLCBcIm1vZGFsXCIpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5TZXRBdHRyaWJ1dGUoXCJkYXRhLXRhcmdldFwiLCBcIiNzZXRIb3Vyc01vZGFsXCIpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5Jbm5lckhUTUwgPSBcIk5hc3Rhdml0IGhvZGlueVwiO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5PbkNsaWNrICs9IChlKSA9PiB7IEVkaXRIb3Vyc0NsaWNrKHNldEhvdXJzLCB0cnVlKTsgfTtcclxuICAgICAgICAgICAgY2FyZC5BcHBlbmRDaGlsZChzZXRIb3Vycyk7XHJcbiAgICAgICAgICAgIGRpdi5BcHBlbmRDaGlsZChjYXJkKTtcclxuXHJcbiAgICAgICAgICAgIGlucHV0LlZhbHVlID0gXCJcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgRWRpdEhvdXJzQ2xpY2sob2JqZWN0IHNlbmRlciwgYm9vbCB3YXNUZWFjaGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgbGFzdFNldFdhc1RlYWNoZXIgPSB3YXNUZWFjaGVyO1xyXG4gICAgICAgICAgICBsYXN0U2V0SWQgPSBpbnQuUGFyc2UoKHNlbmRlciBhcyBIVE1MRWxlbWVudCkuR2V0QXR0cmlidXRlKFwibmFtZVwiKSk7XHJcbiAgICAgICAgICAgIExpc3Q8VXNlcj4gc2VsZWN0ZWRDb2xsZWN0aW9uID0gKHdhc1RlYWNoZXIgPyBwbGFuLnRlYWNoZXJzIDogcGxhbi5zdHVkZW50cyk7XHJcblxyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS1tb25kYXlcIikuSW5uZXJIVE1MID0gc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0uR2V0SG91cnNJbkRheSgwKTtcclxuICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtdHVlc2RheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDEpO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS13ZWRuZXNkYXlcIikuSW5uZXJIVE1MID0gc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0uR2V0SG91cnNJbkRheSgyKTtcclxuICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtdGh1cnNkYXlcIikuSW5uZXJIVE1MID0gc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0uR2V0SG91cnNJbkRheSgzKTtcclxuICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtZnJpZGF5XCIpLklubmVySFRNTCA9IHNlbGVjdGVkQ29sbGVjdGlvbltsYXN0U2V0SWRdLkdldEhvdXJzSW5EYXkoNCk7XHJcblxyXG4gICAgICAgICAgICBHaWQoXCJzZXRUaW1lTW9kYWxJbmZvVGV4dFwiKS5Jbm5lckhUTUwgPSBcIlYgdGVudG8gZGVuIG3DoSBcIiArIHNlbGVjdGVkQ29sbGVjdGlvbltsYXN0U2V0SWRdLm5hbWUgKyBcIiDEjWFzXCI7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcblxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBIVE1MRWxlbWVudCBHaWQoc3RyaW5nIGlkKSB7cmV0dXJuIERvY3VtZW50LkdldEVsZW1lbnRCeUlkKGlkKTt9XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgSFRNTEVsZW1lbnRbXSBHY2woc3RyaW5nIGNscykge3JldHVybiBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLlRvQXJyYXk8Z2xvYmFsOjpCcmlkZ2UuSHRtbDUuSFRNTEVsZW1lbnQ+KERvY3VtZW50LkJvZHkuR2V0RWxlbWVudHNCeUNsYXNzTmFtZShjbHMpKTt9XHJcbiAgICB9XHJcbn0iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpY1xyXG57XHJcbiAgICBjbGFzcyBQbGFuXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIExpc3Q8VXNlcj4gc3R1ZGVudHM7XHJcbiAgICAgICAgcHVibGljIExpc3Q8VXNlcj4gdGVhY2hlcnM7XHJcblxyXG4gICAgICAgIHB1YmxpYyBQbGFuKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0dWRlbnRzID0gbmV3IExpc3Q8VXNlcj4oKTtcclxuICAgICAgICAgICAgdGVhY2hlcnMgPSBuZXcgTGlzdDxVc2VyPigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG9iamVjdCBDYWxjKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBOb3RJbXBsZW1lbnRlZEV4Y2VwdGlvbigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpY1xyXG57XHJcbiAgICBjbGFzcyBVc2VyXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBob3VyTGVuZ3RoID0gNDU7XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgbmFtZTtcclxuICAgICAgICBwdWJsaWMgYm9vbFtdIGRheXNBdmFpbGFibGU7XHJcbiAgICAgICAgcHVibGljIGludFtdIG1pbnV0ZXNGcm9tQXZhaWxhYmxlO1xyXG4gICAgICAgIHB1YmxpYyBpbnRbXSBtaW51dGVzVG9BdmFpbGFibGU7XHJcbiAgICAgICAgcHVibGljIGludCBhc3NpZ25lZENvbnZlcnRlZE1pbnV0ZXNGcm9tO1xyXG5cclxuICAgICAgICBwdWJsaWMgVXNlcihzdHJpbmcgbmFtZSwgYm9vbFtdIGRheXNBdmFpbGFibGUsIGludFtdIG1pbnV0ZXNGcm9tQXZhaWxhYmxlLCBpbnRbXSBtaW51dGVzVG9BdmFpbGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICB0aGlzLmRheXNBdmFpbGFibGUgPSBkYXlzQXZhaWxhYmxlO1xyXG4gICAgICAgICAgICB0aGlzLm1pbnV0ZXNGcm9tQXZhaWxhYmxlID0gbWludXRlc0Zyb21BdmFpbGFibGU7XHJcbiAgICAgICAgICAgIHRoaXMubWludXRlc1RvQXZhaWxhYmxlID0gbWludXRlc1RvQXZhaWxhYmxlO1xyXG4gICAgICAgICAgICBhc3NpZ25lZENvbnZlcnRlZE1pbnV0ZXNGcm9tID0gLTE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RyaW5nIEdldEhvdXJzSW5EYXkoaW50IGRheUluZGV4KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGRheUluZGV4IDwgMCB8fCBkYXlJbmRleCA+PSA1KVxyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEFyZ3VtZW50RXhjZXB0aW9uKFwiUGFyYW1ldGVyIE1VU1QgQkUgaW4gcmFuZ2UgWzA7IDUpLiBWYWx1ZTogXCIgKyBkYXlJbmRleCwgXCJkYXlJbmRleFwiKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghZGF5c0F2YWlsYWJsZVtkYXlJbmRleF0pXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJOZW7DrSBuYXN0YXZlbm9cIjtcclxuXHJcbiAgICAgICAgICAgIGludCBtaW51dGVzRiA9IG1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheUluZGV4XTtcclxuICAgICAgICAgICAgaW50IG1pbnV0ZXNUID0gbWludXRlc1RvQXZhaWxhYmxlW2RheUluZGV4XTtcclxuXHJcbiAgICAgICAgICAgIGludCBob3Vyc0YgPSAoaW50KU1hdGguRmxvb3IobWludXRlc0YgLyA2MGQpO1xyXG4gICAgICAgICAgICBpbnQgaG91cnNUID0gKGludClNYXRoLkZsb29yKG1pbnV0ZXNUIC8gNjBkKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdHJpbmcuRm9ybWF0KFwiT2QgezB9OnsxfSBkbyB7Mn06ezN9XCIsaG91cnNGLChtaW51dGVzRiAtIGhvdXJzRiAqIDYwKS5Ub1N0cmluZyhcIiMjI1wiKSxob3Vyc1QsKG1pbnV0ZXNUIC0gaG91cnNUICogNjApLlRvU3RyaW5nKFwiIyNcIikpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXQp9Cg==
