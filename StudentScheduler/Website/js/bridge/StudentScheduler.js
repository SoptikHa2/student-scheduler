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

            buts = StudentScheduler.App.Gcl("but-time-set");
            for (var i2 = 0; i2 < buts.length; i2 = (i2 + 1) | 0) {
                var c = { v : i2 };
                buts[System.Array.index(i2, buts)].onclick = Bridge.fn.combine(buts[System.Array.index(i2, buts)].onclick, (function ($me, c) {
                    return function (e) {
                        StudentScheduler.App.SomeDayEditHoursClick(buts[System.Array.index(c.v, buts)]);
                    };
                })(this, c));
            }
            StudentScheduler.App.Gid("set-time-hours").onclick = function (e) {
                StudentScheduler.App.SaveHourChange();
                StudentScheduler.App.UpdateListOfDays();
            };

            StudentScheduler.App.Gid("set-time-hours-cancel").onclick = function (e) {
                StudentScheduler.App.RemoveHourInDay();
                StudentScheduler.App.UpdateListOfDays();
            };
        },
        statics: {
            fields: {
                plan: null,
                lastSetWasTeacher: false,
                lastSetId: 0,
                lastSelectedDay: 0,
                dayId: 0,
                days: null
            },
            ctors: {
                init: function () {
                    this.days = System.Array.init([
                        "monday", 
                        "tuesday", 
                        "wednesday", 
                        "thursday", 
                        "friday"
                    ], System.String);
                }
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

                    StudentScheduler.App.UpdateListOfDays();
                },
                SomeDayEditHoursClick: function (sender) {
                    StudentScheduler.App.dayId = System.Int32.parse((Bridge.as(sender, HTMLElement)).getAttribute("name"));

                    var getTimeFromHH = Bridge.as(StudentScheduler.App.Gid("get-time-from-hh"), HTMLInputElement);
                    var getTimeFromMM = Bridge.as(StudentScheduler.App.Gid("get-time-from-mm"), HTMLInputElement);
                    var getTimeToHH = Bridge.as(StudentScheduler.App.Gid("get-time-to-hh"), HTMLInputElement);
                    var getTimeToMM = Bridge.as(StudentScheduler.App.Gid("get-time-to-mm"), HTMLInputElement);

                    var collection = StudentScheduler.App.lastSetWasTeacher ? StudentScheduler.App.plan.teachers : StudentScheduler.App.plan.students;

                    var usr = collection.getItem(StudentScheduler.App.lastSetId);


                    if (usr.minutesFromAvailable[System.Array.index(StudentScheduler.App.dayId, usr.minutesFromAvailable)] > 0) {
                        var hoursFrom = Bridge.Int.clip32(Math.floor(usr.minutesFromAvailable[System.Array.index(StudentScheduler.App.dayId, usr.minutesFromAvailable)] / 60.0));
                        getTimeFromHH.value = hoursFrom.toString();
                        getTimeFromMM.value = (((usr.minutesFromAvailable[System.Array.index(StudentScheduler.App.dayId, usr.minutesFromAvailable)] - Bridge.Int.mul(hoursFrom, 60)) | 0)).toString();
                    } else {
                        getTimeFromHH.value = "";
                        getTimeFromMM.value = "";
                    }


                    if (usr.minutesToAvailable[System.Array.index(StudentScheduler.App.dayId, usr.minutesToAvailable)] > 0) {
                        var hoursTo = Bridge.Int.clip32(Math.floor(usr.minutesToAvailable[System.Array.index(StudentScheduler.App.dayId, usr.minutesToAvailable)] / 60.0));
                        getTimeToHH.value = hoursTo.toString();
                        getTimeToMM.value = System.Double.format((usr.minutesToAvailable[System.Array.index(StudentScheduler.App.dayId, usr.minutesToAvailable)] - hoursTo * 60.0));
                    } else {
                        getTimeToHH.value = "";
                        getTimeToMM.value = "";
                    }
                },
                SaveHourChange: function () {
                    var $t, $t1;
                    var collection = StudentScheduler.App.lastSetWasTeacher ? StudentScheduler.App.plan.teachers : StudentScheduler.App.plan.students;

                    var from = Bridge.Int.clip32((Bridge.as(StudentScheduler.App.Gid("get-time-from-hh"), HTMLInputElement)).valueAsNumber * 60 + (Bridge.as(StudentScheduler.App.Gid("get-time-from-mm"), HTMLInputElement)).valueAsNumber);
                    var to = Bridge.Int.clip32((Bridge.as(StudentScheduler.App.Gid("get-time-to-hh"), HTMLInputElement)).valueAsNumber * 60 + (Bridge.as(StudentScheduler.App.Gid("get-time-to-mm"), HTMLInputElement)).valueAsNumber);

                    if (((from + 45) | 0) > to) {
                        StudentScheduler.App.RemoveHourInDay();
                        return;
                    }

                    ($t = collection.getItem(StudentScheduler.App.lastSetId).minutesFromAvailable)[System.Array.index(StudentScheduler.App.dayId, $t)] = from;
                    ($t1 = collection.getItem(StudentScheduler.App.lastSetId).minutesToAvailable)[System.Array.index(StudentScheduler.App.dayId, $t1)] = to;
                },
                RemoveHourInDay: function () {
                    var $t, $t1;
                    var collection = StudentScheduler.App.lastSetWasTeacher ? StudentScheduler.App.plan.teachers : StudentScheduler.App.plan.students;

                    ($t = collection.getItem(StudentScheduler.App.lastSetId).minutesFromAvailable)[System.Array.index(StudentScheduler.App.dayId, $t)] = 0;
                    ($t1 = collection.getItem(StudentScheduler.App.lastSetId).minutesToAvailable)[System.Array.index(StudentScheduler.App.dayId, $t1)] = 0;
                },
                UpdateListOfDays: function () {
                    var $t, $t1, $t2, $t3;
                    var collection = StudentScheduler.App.lastSetWasTeacher ? StudentScheduler.App.plan.teachers : StudentScheduler.App.plan.students;

                    // Set to all days: if there is at least 45 minutes between two times: return times in format ["HH:MM - HH:MM"], else, return "Není nastaveno"
                    for (var i = 0; i < 5; i = (i + 1) | 0) {
                        StudentScheduler.App.Gid("set-time-" + (StudentScheduler.App.days[System.Array.index(i, StudentScheduler.App.days)] || "")).innerHTML = ((($t = collection.getItem(StudentScheduler.App.lastSetId).minutesToAvailable)[System.Array.index(i, $t)] - ($t1 = collection.getItem(StudentScheduler.App.lastSetId).minutesFromAvailable)[System.Array.index(i, $t1)]) | 0) < 45 ? "Není nastaveno" : (StudentScheduler.App.MinutesToHoursAndMinutes(($t2 = collection.getItem(StudentScheduler.App.lastSetId).minutesFromAvailable)[System.Array.index(i, $t2)]) || "") + " - " + (StudentScheduler.App.MinutesToHoursAndMinutes(($t3 = collection.getItem(StudentScheduler.App.lastSetId).minutesToAvailable)[System.Array.index(i, $t3)]) || "");
                    }
                },
                MinutesToHoursAndMinutes: function (minutes) {
                    var hours = Bridge.Int.clip32(Math.floor(minutes / 60.0));
                    var ret = (StudentScheduler.App.MyNumberToStringWithAtLeastTwoDigitsFormatBecauseBridgeDotNetCannotDoThatSimpleTaskByItself(hours) || "") + ":";
                    return (ret || "") + (StudentScheduler.App.MyNumberToStringWithAtLeastTwoDigitsFormatBecauseBridgeDotNetCannotDoThatSimpleTaskByItself((((minutes - Bridge.Int.mul(hours, 60)) | 0))) || "");
                },
                MyNumberToStringWithAtLeastTwoDigitsFormatBecauseBridgeDotNetCannotDoThatSimpleTaskByItself: function (number) {
                    var num = number.toString();
                    if (num.length === 1) {
                        num = "0" + (num || "");
                    }
                    return num;
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJTdHVkZW50U2NoZWR1bGVyLmpzIiwKICAic291cmNlUm9vdCI6ICIiLAogICJzb3VyY2VzIjogWyJBcHBMb2dpYy9BcHAuY3MiLCJBcHBMb2dpYy9QbGFuLmNzIiwiQXBwTG9naWMvVXNlci5jcyJdLAogICJuYW1lcyI6IFsiIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7O1lBd0JZQSw0QkFBT0EsSUFBSUE7OztZQUdYQSxvQkFBb0JBO1lBQ3BCQSxpRUFBeUJBLFVBQUNBO2dCQUFRQSxtQ0FBY0E7O1lBQ2hEQSxvQkFBb0JBO1lBQ3BCQSxpRUFBeUJBLFVBQUNBO2dCQUFRQSxtQ0FBY0E7OztZQUVoREEsV0FBV0E7WUFDWEEsS0FBS0EsV0FBV0EsSUFBSUEsYUFBYUE7Z0JBQzdCQSx3QkFBS0EsR0FBTEEsMkRBQUtBLEdBQUxBLGdCQUFtQkEsVUFBQ0E7b0JBQVFBLG9DQUFlQSx3QkFBS0EsR0FBTEE7Ozs7WUFFL0NBLE9BQU9BO1lBQ1BBLEtBQUtBLFlBQVdBLEtBQUlBLGFBQWFBO2dCQUM3QkEsd0JBQUtBLElBQUxBLDJEQUFLQSxJQUFMQSxnQkFBbUJBLFVBQUNBO29CQUFRQSxvQ0FBZUEsd0JBQUtBLElBQUxBOzs7O1lBRS9DQSxPQUFPQTtZQUNQQSxLQUFLQSxZQUFXQSxLQUFJQSxhQUFhQTtnQkFFN0JBLGNBQVFBO2dCQUNSQSx3QkFBS0EsSUFBTEEsMkRBQUtBLElBQUxBLGdCQUFtQkE7cUNBQUNBO3dCQUFRQSwyQ0FBc0JBLHdCQUFLQSxLQUFMQTs7OztZQUV0REEscURBQWdDQSxVQUFDQTtnQkFBUUE7Z0JBQWtCQTs7O1lBRTNEQSw0REFBdUNBLFVBQUNBO2dCQUFRQTtnQkFBbUJBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7eUNBR3JDQTs7b0JBRzlCQSxZQUF5QkEsQ0FBQ0Esc0NBQStEQSwyRkFBb0ZBLEFBQThEQTttQ0FBS0EsNkJBQVFBOztvQkFDeFBBLHFCQUF3QkE7b0JBQ3hCQSxJQUFJQTt3QkFDQUE7OztvQkFFSkEs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QkFBV0EseUVBQWdDQSw0QkFBY0EsOENBQXlCQSwwQkFBV0EsdUVBQThCQTs7O29EQU01SUE7b0JBRTNDQSxZQUFXQSxrQkFBS0EsV0FBV0E7b0JBQzNCQSxVQUFhQSxrSEFBNEZBO29CQUN6R0EsT0FBT0EsZUFBTUEsaUhBQTRGQSxDQUFDQSxZQUFVQTs7dUhBR05BO29CQUU5R0EsVUFBYUE7b0JBQ2JBLElBQUlBO3dCQUNBQSxNQUFNQSxPQUFNQTs7b0JBQ2hCQSxPQUFPQTs7K0JBRW9CQTtvQkFBWUEsT0FBT0Esd0JBQXdCQTs7K0JBQ3pDQTtvQkFBYUEsT0FBT0EsNEJBQWlFQSxxQ0FBcUNBOzs7Ozs7Ozs7Ozs7OztnQkN6TXZKQSxnQkFBV0EsS0FBSUE7Z0JBQ2ZBLGdCQUFXQSxLQUFJQTs7Ozs7Z0JBS2ZBLE1BQU1BLElBQUlBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJDSEZBLE1BQWFBLGVBQXNCQSxzQkFBNEJBOztnQkFFdkVBLFlBQVlBO2dCQUNaQSxxQkFBcUJBO2dCQUNyQkEsNEJBQTRCQTtnQkFDNUJBLDBCQUEwQkE7Z0JBQzFCQSxvQ0FBK0JBOzs7O3FDQUdQQTtnQkFFeEJBLElBQUlBLGdCQUFnQkE7b0JBQ2hCQSxNQUFNQSxJQUFJQSx5QkFBa0JBLCtDQUErQ0E7OztnQkFFL0VBLElBQUlBLENBQUNBLHNDQUFjQSxVQUFkQTtvQkFDREE7OztnQkFFSkEsZUFBZUEsNkNBQXFCQSxVQUFyQkE7Z0JBQ2ZBLGVBQWVBLDJDQUFtQkEsVUFBbkJBOztnQkFFZkEsYUFBYUEsa0JBQUtBLFdBQVdBO2dCQUM3QkEsYUFBYUEsa0JBQUtBLFdBQVdBOztnQkFFN0JBLE9BQU9BLDhDQUFzQ0Esa0NBQU9BLHFCQUFDQSxhQUFXQSwyQ0FBNkJBLGtDQUFPQSxxQkFBQ0EsYUFBV0EiLAogICJzb3VyY2VzQ29udGVudCI6IFsidXNpbmcgQnJpZGdlO1xyXG51c2luZyBCcmlkZ2UuSHRtbDU7XHJcbnVzaW5nIE5ld3RvbnNvZnQuSnNvbjtcclxudXNpbmcgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYztcclxudXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlclxyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgQXBwXHJcbiAgICB7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgUGxhbiBwbGFuO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGJvb2wgbGFzdFNldFdhc1RlYWNoZXI7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW50IGxhc3RTZXRJZDtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpbnQgbGFzdFNlbGVjdGVkRGF5O1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGludCBkYXlJZDtcclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgc3RyaW5nW10gZGF5cyA9IHsgXCJtb25kYXlcIiwgXCJ0dWVzZGF5XCIsIFwid2VkbmVzZGF5XCIsIFwidGh1cnNkYXlcIiwgXCJmcmlkYXlcIiB9O1xyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHZvaWQgTWFpbigpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgLy8gVE9ETzogbG9hZD9cclxuICAgICAgICAgICAgcGxhbiA9IG5ldyBQbGFuKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZWdpc3RlciBjYWxsYmFja3NcclxuICAgICAgICAgICAgdmFyIGJ1dE5ld1RlYWNoZXIgPSBHaWQoXCJhZGQtdGVhY2hlclwiKTtcclxuICAgICAgICAgICAgYnV0TmV3VGVhY2hlci5PbkNsaWNrICs9IChlKSA9PiB7IEFkZE5ld1RlYWNoZXIoYnV0TmV3VGVhY2hlcik7IH07XHJcbiAgICAgICAgICAgIHZhciBidXROZXdTdHVkZW50ID0gR2lkKFwiYWRkLXN0dWRlbnRcIik7XHJcbiAgICAgICAgICAgIGJ1dE5ld1N0dWRlbnQuT25DbGljayArPSAoZSkgPT4geyBBZGROZXdTdHVkZW50KGJ1dE5ld1N0dWRlbnQpOyB9O1xyXG5cclxuICAgICAgICAgICAgdmFyIGJ1dHMgPSBHY2woXCJ0ZWFjaGVyLWNsaWNrXCIpO1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGJ1dHMuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgICAgICBidXRzW2ldLk9uQ2xpY2sgKz0gKGUpID0+IHsgRWRpdEhvdXJzQ2xpY2soYnV0c1tpXSwgdHJ1ZSk7IH07XHJcblxyXG4gICAgICAgICAgICBidXRzID0gR2NsKFwic3R1ZGVudC1jbGlja1wiKTtcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBidXRzLkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICAgICAgYnV0c1tpXS5PbkNsaWNrICs9IChlKSA9PiB7IEVkaXRIb3Vyc0NsaWNrKGJ1dHNbaV0sIGZhbHNlKTsgfTtcclxuXHJcbiAgICAgICAgICAgIGJ1dHMgPSBHY2woXCJidXQtdGltZS1zZXRcIik7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgYnV0cy5MZW5ndGg7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IGMgPSBpO1xyXG4gICAgICAgICAgICAgICAgYnV0c1tpXS5PbkNsaWNrICs9IChlKSA9PiB7IFNvbWVEYXlFZGl0SG91cnNDbGljayhidXRzW2NdKTsgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS1ob3Vyc1wiKS5PbkNsaWNrID0gKGUpID0+IHsgU2F2ZUhvdXJDaGFuZ2UoKTsgVXBkYXRlTGlzdE9mRGF5cygpOyB9O1xyXG5cclxuICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtaG91cnMtY2FuY2VsXCIpLk9uQ2xpY2sgPSAoZSkgPT4geyBSZW1vdmVIb3VySW5EYXkoKTsgVXBkYXRlTGlzdE9mRGF5cygpOyB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBBZGROZXdUZWFjaGVyKEhUTUxFbGVtZW50IHNlbmRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIEdldCBuYW1lIGlucHV0IGFuZCBpdCdzIHZhbHVlXHJcbiAgICAgICAgICAgIEhUTUxJbnB1dEVsZW1lbnQgaW5wdXQgPSAoU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OkJyaWRnZS5IdG1sNS5IVE1MRWxlbWVudD4oc2VuZGVyLlBhcmVudEVsZW1lbnQuUGFyZW50RWxlbWVudC5HZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiZm9ybS1ncm91cFwiKVswXS5DaGlsZHJlbiwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OkJyaWRnZS5IdG1sNS5IVE1MRWxlbWVudCwgYm9vbD4pKHggPT4geC5JZCA9PSAoXCJ0ZWFjaGVyLW5hbWVcIikpKS5GaXJzdCgpIGFzIEhUTUxJbnB1dEVsZW1lbnQpO1xyXG4gICAgICAgICAgICBzdHJpbmcgbmV3VGVhY2hlck5hbWUgPSBpbnB1dC5WYWx1ZTtcclxuICAgICAgICAgICAgaWYgKG5ld1RlYWNoZXJOYW1lID09IFwiXCIpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBwbGFuLnRlYWNoZXJzLkFkZChuZXcgVXNlcihuZXdUZWFjaGVyTmFtZSwgbmV3IGJvb2xbNV0sIG5ldyBpbnRbNV0sIG5ldyBpbnRbNV0pKTtcclxuICAgICAgICAgICAgSFRNTEVsZW1lbnQgZGl2ID0gR2lkKFwidGVhY2hlcnNcIik7XHJcblxyXG4gICAgICAgICAgICBIVE1MRGl2RWxlbWVudCBjYXJkID0gbmV3IEhUTUxEaXZFbGVtZW50KCk7XHJcbiAgICAgICAgICAgIGNhcmQuQ2xhc3NOYW1lID0gXCJjYXJkIGNhcmQtYm9keVwiO1xyXG4gICAgICAgICAgICBjYXJkLklubmVySFRNTCArPSBcIjxwPjxzdHJvbmc+XCIgKyBuZXdUZWFjaGVyTmFtZSArIFwiPC9zdHJvbmc+PC9wPlwiO1xyXG4gICAgICAgICAgICBIVE1MQnV0dG9uRWxlbWVudCBzZXRIb3VycyA9IG5ldyBIVE1MQnV0dG9uRWxlbWVudCgpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5OYW1lID0gKHBsYW4udGVhY2hlcnMuQ291bnQgLSAxKS5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5DbGFzc05hbWUgPSBcImJ0biBidG4tcHJpbWFyeSB0ZWFjaGVyLWNsaWNrXCI7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLlNldEF0dHJpYnV0ZShcImRhdGEtdG9nZ2xlXCIsIFwibW9kYWxcIik7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLlNldEF0dHJpYnV0ZShcImRhdGEtdGFyZ2V0XCIsIFwiI3NldEhvdXJzTW9kYWxcIik7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLklubmVySFRNTCA9IFwiTmFzdGF2aXQgaG9kaW55XCI7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLk9uQ2xpY2sgKz0gKGUpID0+IHsgRWRpdEhvdXJzQ2xpY2soc2V0SG91cnMsIHRydWUpOyB9O1xyXG4gICAgICAgICAgICBjYXJkLkFwcGVuZENoaWxkKHNldEhvdXJzKTtcclxuICAgICAgICAgICAgZGl2LkFwcGVuZENoaWxkKGNhcmQpO1xyXG5cclxuICAgICAgICAgICAgaW5wdXQuVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBBZGROZXdTdHVkZW50KEhUTUxFbGVtZW50IHNlbmRlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIEdldCBuYW1lIGlucHV0IGFuZCBpdCdzIHZhbHVlXHJcbiAgICAgICAgICAgIEhUTUxJbnB1dEVsZW1lbnQgaW5wdXQgPSAoU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OkJyaWRnZS5IdG1sNS5IVE1MRWxlbWVudD4oc2VuZGVyLlBhcmVudEVsZW1lbnQuUGFyZW50RWxlbWVudC5HZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwiZm9ybS1ncm91cFwiKVswXS5DaGlsZHJlbiwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OkJyaWRnZS5IdG1sNS5IVE1MRWxlbWVudCwgYm9vbD4pKHggPT4geC5JZCA9PSAoXCJzdHVkZW50LW5hbWVcIikpKS5GaXJzdCgpIGFzIEhUTUxJbnB1dEVsZW1lbnQpO1xyXG4gICAgICAgICAgICBzdHJpbmcgbmV3U3R1ZGVudE5hbWUgPSBpbnB1dC5WYWx1ZTtcclxuICAgICAgICAgICAgaWYgKG5ld1N0dWRlbnROYW1lID09IFwiXCIpXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBwbGFuLnN0dWRlbnRzLkFkZChuZXcgVXNlcihuZXdTdHVkZW50TmFtZSwgbmV3IGJvb2xbNV0sIG5ldyBpbnRbNV0sIG5ldyBpbnRbNV0pKTtcclxuICAgICAgICAgICAgSFRNTEVsZW1lbnQgZGl2ID0gR2lkKFwic3R1ZGVudHNcIik7XHJcblxyXG4gICAgICAgICAgICBIVE1MRGl2RWxlbWVudCBjYXJkID0gbmV3IEhUTUxEaXZFbGVtZW50KCk7XHJcbiAgICAgICAgICAgIGNhcmQuQ2xhc3NOYW1lID0gXCJjYXJkIGNhcmQtYm9keVwiO1xyXG4gICAgICAgICAgICBjYXJkLklubmVySFRNTCArPSBcIjxwPjxzdHJvbmc+XCIgKyBuZXdTdHVkZW50TmFtZSArIFwiPC9zdHJvbmc+PC9wPlwiO1xyXG4gICAgICAgICAgICBIVE1MQnV0dG9uRWxlbWVudCBzZXRIb3VycyA9IG5ldyBIVE1MQnV0dG9uRWxlbWVudCgpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5OYW1lID0gKHBsYW4udGVhY2hlcnMuQ291bnQgLSAxKS5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5DbGFzc05hbWUgPSBcImJ0biBidG4tcHJpbWFyeSB0ZWFjaGVyLWNsaWNrXCI7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLlNldEF0dHJpYnV0ZShcImRhdGEtdG9nZ2xlXCIsIFwibW9kYWxcIik7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLlNldEF0dHJpYnV0ZShcImRhdGEtdGFyZ2V0XCIsIFwiI3NldEhvdXJzTW9kYWxcIik7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLklubmVySFRNTCA9IFwiTmFzdGF2aXQgaG9kaW55XCI7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLk9uQ2xpY2sgKz0gKGUpID0+IHsgRWRpdEhvdXJzQ2xpY2soc2V0SG91cnMsIHRydWUpOyB9O1xyXG4gICAgICAgICAgICBjYXJkLkFwcGVuZENoaWxkKHNldEhvdXJzKTtcclxuICAgICAgICAgICAgZGl2LkFwcGVuZENoaWxkKGNhcmQpO1xyXG5cclxuICAgICAgICAgICAgaW5wdXQuVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBFZGl0SG91cnNDbGljayhvYmplY3Qgc2VuZGVyLCBib29sIHdhc1RlYWNoZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsYXN0U2V0V2FzVGVhY2hlciA9IHdhc1RlYWNoZXI7XHJcbiAgICAgICAgICAgIGxhc3RTZXRJZCA9IGludC5QYXJzZSgoc2VuZGVyIGFzIEhUTUxFbGVtZW50KS5HZXRBdHRyaWJ1dGUoXCJuYW1lXCIpKTtcclxuICAgICAgICAgICAgTGlzdDxVc2VyPiBzZWxlY3RlZENvbGxlY3Rpb24gPSAod2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzKTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLW1vbmRheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDApO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS10dWVzZGF5XCIpLklubmVySFRNTCA9IHNlbGVjdGVkQ29sbGVjdGlvbltsYXN0U2V0SWRdLkdldEhvdXJzSW5EYXkoMSk7XHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLXdlZG5lc2RheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDIpO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS10aHVyc2RheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDMpO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS1mcmlkYXlcIikuSW5uZXJIVE1MID0gc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0uR2V0SG91cnNJbkRheSg0KTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInNldFRpbWVNb2RhbEluZm9UZXh0XCIpLklubmVySFRNTCA9IFwiViB0ZW50byBkZW4gbcOhIFwiICsgc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0ubmFtZSArIFwiIMSNYXNcIjtcclxuXHJcbiAgICAgICAgICAgIFVwZGF0ZUxpc3RPZkRheXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgU29tZURheUVkaXRIb3Vyc0NsaWNrKG9iamVjdCBzZW5kZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkYXlJZCA9IGludC5QYXJzZSgoc2VuZGVyIGFzIEhUTUxFbGVtZW50KS5HZXRBdHRyaWJ1dGUoXCJuYW1lXCIpKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBnZXRUaW1lRnJvbUhIID0gR2lkKFwiZ2V0LXRpbWUtZnJvbS1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgICAgICB2YXIgZ2V0VGltZUZyb21NTSA9IEdpZChcImdldC10aW1lLWZyb20tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICAgICAgdmFyIGdldFRpbWVUb0hIID0gR2lkKFwiZ2V0LXRpbWUtdG8taGhcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICAgICAgdmFyIGdldFRpbWVUb01NID0gR2lkKFwiZ2V0LXRpbWUtdG8tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gbGFzdFNldFdhc1RlYWNoZXIgPyBwbGFuLnRlYWNoZXJzIDogcGxhbi5zdHVkZW50cztcclxuXHJcbiAgICAgICAgICAgIHZhciB1c3IgPSBjb2xsZWN0aW9uW2xhc3RTZXRJZF07XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHVzci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gPiAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgaG91cnNGcm9tID0gKGludClNYXRoLkZsb29yKHVzci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gLyA2MGQpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZUZyb21ISC5WYWx1ZSA9IGhvdXJzRnJvbS5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZUZyb21NTS5WYWx1ZSA9ICh1c3IubWludXRlc0Zyb21BdmFpbGFibGVbZGF5SWRdIC0gaG91cnNGcm9tICogNjApLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lRnJvbUhILlZhbHVlID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGdldFRpbWVGcm9tTU0uVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHVzci5taW51dGVzVG9BdmFpbGFibGVbZGF5SWRdID4gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IGhvdXJzVG8gPSAoaW50KU1hdGguRmxvb3IodXNyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXlJZF0gLyA2MGQpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZVRvSEguVmFsdWUgPSBob3Vyc1RvLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9NTS5WYWx1ZSA9ICh1c3IubWludXRlc1RvQXZhaWxhYmxlW2RheUlkXSAtIGhvdXJzVG8gKiA2MGQpLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9ISC5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9NTS5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgU2F2ZUhvdXJDaGFuZ2UoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBsYXN0U2V0V2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzO1xyXG5cclxuICAgICAgICAgICAgaW50IGZyb20gPSAoaW50KSgoR2lkKFwiZ2V0LXRpbWUtZnJvbS1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZUFzTnVtYmVyICogNjAgKyAoR2lkKFwiZ2V0LXRpbWUtZnJvbS1tbVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZUFzTnVtYmVyKTtcclxuICAgICAgICAgICAgaW50IHRvID0gKGludCkoKEdpZChcImdldC10aW1lLXRvLWhoXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLlZhbHVlQXNOdW1iZXIgKiA2MCArIChHaWQoXCJnZXQtdGltZS10by1tbVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZUFzTnVtYmVyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChmcm9tICsgNDUgPiB0bylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgUmVtb3ZlSG91ckluRGF5KCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gPSBmcm9tO1xyXG4gICAgICAgICAgICBjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc1RvQXZhaWxhYmxlW2RheUlkXSA9IHRvO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBSZW1vdmVIb3VySW5EYXkoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBsYXN0U2V0V2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzO1xyXG5cclxuICAgICAgICAgICAgY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheUlkXSA9IDA7XHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzVG9BdmFpbGFibGVbZGF5SWRdID0gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgVXBkYXRlTGlzdE9mRGF5cygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB2YXIgY29sbGVjdGlvbiA9IGxhc3RTZXRXYXNUZWFjaGVyID8gcGxhbi50ZWFjaGVycyA6IHBsYW4uc3R1ZGVudHM7XHJcblxyXG4gICAgICAgICAgICAvLyBTZXQgdG8gYWxsIGRheXM6IGlmIHRoZXJlIGlzIGF0IGxlYXN0IDQ1IG1pbnV0ZXMgYmV0d2VlbiB0d28gdGltZXM6IHJldHVybiB0aW1lcyBpbiBmb3JtYXQgW1wiSEg6TU0gLSBISDpNTVwiXSwgZWxzZSwgcmV0dXJuIFwiTmVuw60gbmFzdGF2ZW5vXCJcclxuICAgICAgICAgICAgZm9yKGludCBpID0gMDsgaSA8IDU7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtXCIgKyBkYXlzW2ldKS5Jbm5lckhUTUwgPSBjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc1RvQXZhaWxhYmxlW2ldIC0gY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2ldIDwgNDUgPyBcIk5lbsOtIG5hc3RhdmVub1wiIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNaW51dGVzVG9Ib3Vyc0FuZE1pbnV0ZXMoY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2ldKSArIFwiIC0gXCIgKyBNaW51dGVzVG9Ib3Vyc0FuZE1pbnV0ZXMoY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNUb0F2YWlsYWJsZVtpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgc3RyaW5nIE1pbnV0ZXNUb0hvdXJzQW5kTWludXRlcyhpbnQgbWludXRlcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludCBob3Vycz0gKGludClNYXRoLkZsb29yKG1pbnV0ZXMgLyA2MGQpO1xyXG4gICAgICAgICAgICBzdHJpbmcgcmV0ID0gTXlOdW1iZXJUb1N0cmluZ1dpdGhBdExlYXN0VHdvRGlnaXRzRm9ybWF0QmVjYXVzZUJyaWRnZURvdE5ldENhbm5vdERvVGhhdFNpbXBsZVRhc2tCeUl0c2VsZihob3VycykgKyBcIjpcIjtcclxuICAgICAgICAgICAgcmV0dXJuIHJldCArIE15TnVtYmVyVG9TdHJpbmdXaXRoQXRMZWFzdFR3b0RpZ2l0c0Zvcm1hdEJlY2F1c2VCcmlkZ2VEb3ROZXRDYW5ub3REb1RoYXRTaW1wbGVUYXNrQnlJdHNlbGYoKG1pbnV0ZXMgLSBob3VycyAqIDYwKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBzdHJpbmcgTXlOdW1iZXJUb1N0cmluZ1dpdGhBdExlYXN0VHdvRGlnaXRzRm9ybWF0QmVjYXVzZUJyaWRnZURvdE5ldENhbm5vdERvVGhhdFNpbXBsZVRhc2tCeUl0c2VsZihpbnQgbnVtYmVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3RyaW5nIG51bSA9IG51bWJlci5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICBpZiAobnVtLkxlbmd0aCA9PSAxKVxyXG4gICAgICAgICAgICAgICAgbnVtID0gXCIwXCIgKyBudW07XHJcbiAgICAgICAgICAgIHJldHVybiBudW07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIEhUTUxFbGVtZW50IEdpZChzdHJpbmcgaWQpIHtyZXR1cm4gRG9jdW1lbnQuR2V0RWxlbWVudEJ5SWQoaWQpO31cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBIVE1MRWxlbWVudFtdIEdjbChzdHJpbmcgY2xzKSB7cmV0dXJuIFN5c3RlbS5MaW5xLkVudW1lcmFibGUuVG9BcnJheTxnbG9iYWw6OkJyaWRnZS5IdG1sNS5IVE1MRWxlbWVudD4oRG9jdW1lbnQuQm9keS5HZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGNscykpO31cclxuICAgIH1cclxufSIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljXHJcbntcclxuICAgIGNsYXNzIFBsYW5cclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgTGlzdDxVc2VyPiBzdHVkZW50cztcclxuICAgICAgICBwdWJsaWMgTGlzdDxVc2VyPiB0ZWFjaGVycztcclxuXHJcbiAgICAgICAgcHVibGljIFBsYW4oKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3R1ZGVudHMgPSBuZXcgTGlzdDxVc2VyPigpO1xyXG4gICAgICAgICAgICB0ZWFjaGVycyA9IG5ldyBMaXN0PFVzZXI+KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgb2JqZWN0IENhbGMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IE5vdEltcGxlbWVudGVkRXhjZXB0aW9uKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljXHJcbntcclxuICAgIGNsYXNzIFVzZXJcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IGhvdXJMZW5ndGggPSA0NTtcclxuXHJcbiAgICAgICAgcHVibGljIHN0cmluZyBuYW1lO1xyXG4gICAgICAgIHB1YmxpYyBib29sW10gZGF5c0F2YWlsYWJsZTtcclxuICAgICAgICBwdWJsaWMgaW50W10gbWludXRlc0Zyb21BdmFpbGFibGU7XHJcbiAgICAgICAgcHVibGljIGludFtdIG1pbnV0ZXNUb0F2YWlsYWJsZTtcclxuICAgICAgICBwdWJsaWMgaW50IGFzc2lnbmVkQ29udmVydGVkTWludXRlc0Zyb207XHJcblxyXG4gICAgICAgIHB1YmxpYyBVc2VyKHN0cmluZyBuYW1lLCBib29sW10gZGF5c0F2YWlsYWJsZSwgaW50W10gbWludXRlc0Zyb21BdmFpbGFibGUsIGludFtdIG1pbnV0ZXNUb0F2YWlsYWJsZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgICAgIHRoaXMuZGF5c0F2YWlsYWJsZSA9IGRheXNBdmFpbGFibGU7XHJcbiAgICAgICAgICAgIHRoaXMubWludXRlc0Zyb21BdmFpbGFibGUgPSBtaW51dGVzRnJvbUF2YWlsYWJsZTtcclxuICAgICAgICAgICAgdGhpcy5taW51dGVzVG9BdmFpbGFibGUgPSBtaW51dGVzVG9BdmFpbGFibGU7XHJcbiAgICAgICAgICAgIGFzc2lnbmVkQ29udmVydGVkTWludXRlc0Zyb20gPSAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgR2V0SG91cnNJbkRheShpbnQgZGF5SW5kZXgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoZGF5SW5kZXggPCAwIHx8IGRheUluZGV4ID49IDUpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgQXJndW1lbnRFeGNlcHRpb24oXCJQYXJhbWV0ZXIgTVVTVCBCRSBpbiByYW5nZSBbMDsgNSkuIFZhbHVlOiBcIiArIGRheUluZGV4LCBcImRheUluZGV4XCIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFkYXlzQXZhaWxhYmxlW2RheUluZGV4XSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIk5lbsOtIG5hc3RhdmVub1wiO1xyXG5cclxuICAgICAgICAgICAgaW50IG1pbnV0ZXNGID0gbWludXRlc0Zyb21BdmFpbGFibGVbZGF5SW5kZXhdO1xyXG4gICAgICAgICAgICBpbnQgbWludXRlc1QgPSBtaW51dGVzVG9BdmFpbGFibGVbZGF5SW5kZXhdO1xyXG5cclxuICAgICAgICAgICAgaW50IGhvdXJzRiA9IChpbnQpTWF0aC5GbG9vcihtaW51dGVzRiAvIDYwZCk7XHJcbiAgICAgICAgICAgIGludCBob3Vyc1QgPSAoaW50KU1hdGguRmxvb3IobWludXRlc1QgLyA2MGQpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJPZCB7MH06ezF9IGRvIHsyfTp7M31cIixob3Vyc0YsKG1pbnV0ZXNGIC0gaG91cnNGICogNjApLlRvU3RyaW5nKFwiIyMjXCIpLGhvdXJzVCwobWludXRlc1QgLSBob3Vyc1QgKiA2MCkuVG9TdHJpbmcoXCIjI1wiKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdCn0K
