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
                    setHours.setAttribute("data-target", "#setHoursTeacherModal");
                    setHours.innerHTML = "Nastavit hodiny";
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
                    setHours.setAttribute("data-target", "#setHoursStudentModal");
                    setHours.innerHTML = "Nastavit hodiny";
                    card.appendChild(setHours);
                    div.appendChild(card);

                    input.value = "";
                },
                TeacherEditHoursClick: function (sender) {

                },
                StudentEditHoursClick: function (sender) {

                },
                Gid: function (id) {
                    return document.getElementById(id);
                },
                Gcl: function (cls) {
                    return System.Linq.Enumerable.from(document.getElementsByClassName(cls)).toArray();
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
            availableMinutes: null,
            assignedConvertedMinutesFrom: 0
        },
        ctors: {
            ctor: function (name, daysAvailable, minutesFromAvailable, minutesToAvailable) {
                this.$initialize();
                this.name = name;
                this.daysAvailable = daysAvailable;
                this.minutesFromAvailable = minutesFromAvailable;
                this.minutesToAvailable = minutesToAvailable;
                this.assignedConvertedMinutesFrom = 0;
                this.availableMinutes = System.Array.init(1440, false, System.Boolean);

                // For all days
                for (var i = 0; i < 5; i = (i + 1) | 0) {
                    if (!daysAvailable[System.Array.index(i, daysAvailable)]) {
                        continue;
                    }

                    // Go for every 5 minutes
                    var c = 0;
                    for (var m = 0; m < 1440; m = (m + 5) | 0) {
                        var currentminute = Bridge.Int.mul(Bridge.Int.mul(i, 24), 60);
                        if (minutesFromAvailable[System.Array.index(i, minutesFromAvailable)] <= currentminute && minutesToAvailable[System.Array.index(i, minutesToAvailable)] >= ((currentminute + StudentScheduler.AppLogic.User.hourLength) | 0)) {
                            this.availableMinutes[System.Array.index(c, this.availableMinutes)] = true;
                        }
                        c = (c + 1) | 0;
                    }
                }
            }
        }
    });
});

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJTdHVkZW50U2NoZWR1bGVyLmpzIiwKICAic291cmNlUm9vdCI6ICIiLAogICJzb3VyY2VzIjogWyJBcHBMb2dpYy9BcHAuY3MiLCJBcHBMb2dpYy9QbGFuLmNzIiwiQXBwTG9naWMvVXNlci5jcyJdLAogICJuYW1lcyI6IFsiIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7WUFrQllBLDRCQUFPQSxJQUFJQTs7O1lBR1hBLG9CQUFvQkE7WUFDcEJBLGlFQUF5QkEsVUFBQ0E7Z0JBQVFBLG1DQUFjQTs7WUFDaERBLG9CQUFvQkE7WUFDcEJBLGlFQUF5QkEsVUFBQ0E7Z0JBQVFBLG1DQUFjQTs7Ozs7Ozs7Ozt5Q0FHbEJBOztvQkFHOUJBLFlBQXlCQSxDQUFDQSxzQ0FBK0RBLDJGQUFvRkEsQUFBOERBO21DQUFLQSw2QkFBUUE7O29CQUN4UEEscUJBQXdCQTtvQkFDeEJBLElBQUlBO3dCQUNBQTs7O29CQUVKQSx1Q0FBa0JBLElBQUlBLCtCQUFLQSxnQkFBZ0JBLDZDQUFhQSx1Q0FBWUE7b0JBQ3BFQSxVQUFrQkE7O29CQUVsQkEsV0FBc0JBO29CQUN0QkE7b0JBQ0FBLDJDQUFrQkEsa0JBQWdCQTtvQkFDbENBLGVBQTZCQTtvQkFDN0JBLGdCQUFnQkEsQ0FBQ0E7b0JBQ2pCQTtvQkFDQUE7b0JBQ0FBO29CQUNBQTtvQkFDQUEsaUJBQWlCQTtvQkFDakJBLGdCQUFnQkE7O29CQUVoQkE7O3lDQUc4QkE7O29CQUc5QkEsWUFBeUJBLENBQUNBLHNDQUErREEsMkZBQW9GQSxBQUE4REE7bUNBQUtBLDZCQUFRQTs7b0JBQ3hQQSxxQkFBd0JBO29CQUN4QkEsSUFBSUE7d0JBQ0FBOzs7b0JBRUpBLHVDQUFrQkEsSUFBSUEsK0JBQUtBLGdCQUFnQkEsNkNBQWFBLHVDQUFZQTtvQkFDcEVBLFVBQWtCQTs7b0JBRWxCQSxXQUFzQkE7b0JBQ3RCQTtvQkFDQUEsMkNBQWtCQSxrQkFBZ0JBO29CQUNsQ0EsZUFBNkJBO29CQUM3QkEsZ0JBQWdCQSxDQUFDQTtvQkFDakJBO29CQUNBQTtvQkFDQUE7b0JBQ0FBO29CQUNBQSxpQkFBaUJBO29CQUNqQkEsZ0JBQWdCQTs7b0JBRWhCQTs7aURBR3NDQTs7O2lEQUtBQTs7OytCQVFYQTtvQkFBWUEsT0FBT0Esd0JBQXdCQTs7K0JBQ3pDQTtvQkFBYUEsT0FBT0EsNEJBQWlFQSxnQ0FBZ0NBOzs7Ozs7Ozs7Ozs7OztnQkM5RWxKQSxnQkFBV0EsS0FBSUE7Z0JBQ2ZBLGdCQUFXQSxLQUFJQTs7Ozs7Z0JBS2ZBLE1BQU1BLElBQUlBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQ0ZGQSxNQUFhQSxlQUFzQkEsc0JBQTRCQTs7Z0JBRXZFQSxZQUFZQTtnQkFDWkEscUJBQXFCQTtnQkFDckJBLDRCQUE0QkE7Z0JBQzVCQSwwQkFBMEJBO2dCQUMxQkE7Z0JBQ0FBLHdCQUFtQkEsa0JBQVNBOzs7Z0JBRzVCQSxLQUFLQSxXQUFXQSxPQUFPQTtvQkFFbkJBLElBQUlBLENBQUNBLGlDQUFjQSxHQUFkQTt3QkFDREE7Ozs7b0JBR0pBO29CQUNBQSxLQUFLQSxXQUFXQSxJQUFJQSxNQUFTQTt3QkFFekJBLG9CQUFvQkE7d0JBQ3BCQSxJQUFJQSx3Q0FBcUJBLEdBQXJCQSwwQkFBMkJBLGlCQUMzQkEsc0NBQW1CQSxHQUFuQkEsd0JBQXlCQSxrQkFBZ0JBOzRCQUN6Q0EseUNBQWlCQSxHQUFqQkE7O3dCQUNKQSIsCiAgInNvdXJjZXNDb250ZW50IjogWyJ1c2luZyBCcmlkZ2U7XHJcbnVzaW5nIEJyaWRnZS5IdG1sNTtcclxudXNpbmcgTmV3dG9uc29mdC5Kc29uO1xyXG51c2luZyBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljO1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG5cclxubmFtZXNwYWNlIFN0dWRlbnRTY2hlZHVsZXJcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEFwcFxyXG4gICAge1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIFBsYW4gcGxhbjtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBib29sIGxhc3RTZXRXYXNUZWFjaGVyO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGludCBsYXN0U2V0SWQ7XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBNYWluKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIFRPRE86IGxvYWQ/XHJcbiAgICAgICAgICAgIHBsYW4gPSBuZXcgUGxhbigpO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVnaXN0ZXIgY2FsbGJhY2tzXHJcbiAgICAgICAgICAgIHZhciBidXROZXdUZWFjaGVyID0gR2lkKFwiYWRkLXRlYWNoZXJcIik7XHJcbiAgICAgICAgICAgIGJ1dE5ld1RlYWNoZXIuT25DbGljayArPSAoZSkgPT4geyBBZGROZXdUZWFjaGVyKGJ1dE5ld1RlYWNoZXIpOyB9O1xyXG4gICAgICAgICAgICB2YXIgYnV0TmV3U3R1ZGVudCA9IEdpZChcImFkZC1zdHVkZW50XCIpO1xyXG4gICAgICAgICAgICBidXROZXdTdHVkZW50Lk9uQ2xpY2sgKz0gKGUpID0+IHsgQWRkTmV3U3R1ZGVudChidXROZXdTdHVkZW50KTsgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgQWRkTmV3VGVhY2hlcihIVE1MRWxlbWVudCBzZW5kZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBHZXQgbmFtZSBpbnB1dCBhbmQgaXQncyB2YWx1ZVxyXG4gICAgICAgICAgICBIVE1MSW5wdXRFbGVtZW50IGlucHV0ID0gKFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpCcmlkZ2UuSHRtbDUuSFRNTEVsZW1lbnQ+KHNlbmRlci5QYXJlbnRFbGVtZW50LlBhcmVudEVsZW1lbnQuR2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImZvcm0tZ3JvdXBcIilbMF0uQ2hpbGRyZW4sKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpCcmlkZ2UuSHRtbDUuSFRNTEVsZW1lbnQsIGJvb2w+KSh4ID0+IHguSWQgPT0gKFwidGVhY2hlci1uYW1lXCIpKSkuRmlyc3QoKSBhcyBIVE1MSW5wdXRFbGVtZW50KTtcclxuICAgICAgICAgICAgc3RyaW5nIG5ld1RlYWNoZXJOYW1lID0gaW5wdXQuVmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChuZXdUZWFjaGVyTmFtZSA9PSBcIlwiKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgcGxhbi50ZWFjaGVycy5BZGQobmV3IFVzZXIobmV3VGVhY2hlck5hbWUsIG5ldyBib29sWzVdLCBuZXcgaW50WzVdLCBuZXcgaW50WzVdKSk7XHJcbiAgICAgICAgICAgIEhUTUxFbGVtZW50IGRpdiA9IEdpZChcInRlYWNoZXJzXCIpO1xyXG5cclxuICAgICAgICAgICAgSFRNTERpdkVsZW1lbnQgY2FyZCA9IG5ldyBIVE1MRGl2RWxlbWVudCgpO1xyXG4gICAgICAgICAgICBjYXJkLkNsYXNzTmFtZSA9IFwiY2FyZCBjYXJkLWJvZHlcIjtcclxuICAgICAgICAgICAgY2FyZC5Jbm5lckhUTUwgKz0gXCI8cD48c3Ryb25nPlwiICsgbmV3VGVhY2hlck5hbWUgKyBcIjwvc3Ryb25nPjwvcD5cIjtcclxuICAgICAgICAgICAgSFRNTEJ1dHRvbkVsZW1lbnQgc2V0SG91cnMgPSBuZXcgSFRNTEJ1dHRvbkVsZW1lbnQoKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuTmFtZSA9IChwbGFuLnRlYWNoZXJzLkNvdW50IC0gMSkuVG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuQ2xhc3NOYW1lID0gXCJidG4gYnRuLXByaW1hcnkgdGVhY2hlci1jbGlja1wiO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5TZXRBdHRyaWJ1dGUoXCJkYXRhLXRvZ2dsZVwiLCBcIm1vZGFsXCIpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5TZXRBdHRyaWJ1dGUoXCJkYXRhLXRhcmdldFwiLCBcIiNzZXRIb3Vyc1RlYWNoZXJNb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuSW5uZXJIVE1MID0gXCJOYXN0YXZpdCBob2RpbnlcIjtcclxuICAgICAgICAgICAgY2FyZC5BcHBlbmRDaGlsZChzZXRIb3Vycyk7XHJcbiAgICAgICAgICAgIGRpdi5BcHBlbmRDaGlsZChjYXJkKTtcclxuXHJcbiAgICAgICAgICAgIGlucHV0LlZhbHVlID0gXCJcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgQWRkTmV3U3R1ZGVudChIVE1MRWxlbWVudCBzZW5kZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBHZXQgbmFtZSBpbnB1dCBhbmQgaXQncyB2YWx1ZVxyXG4gICAgICAgICAgICBIVE1MSW5wdXRFbGVtZW50IGlucHV0ID0gKFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpCcmlkZ2UuSHRtbDUuSFRNTEVsZW1lbnQ+KHNlbmRlci5QYXJlbnRFbGVtZW50LlBhcmVudEVsZW1lbnQuR2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImZvcm0tZ3JvdXBcIilbMF0uQ2hpbGRyZW4sKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpCcmlkZ2UuSHRtbDUuSFRNTEVsZW1lbnQsIGJvb2w+KSh4ID0+IHguSWQgPT0gKFwic3R1ZGVudC1uYW1lXCIpKSkuRmlyc3QoKSBhcyBIVE1MSW5wdXRFbGVtZW50KTtcclxuICAgICAgICAgICAgc3RyaW5nIG5ld1N0dWRlbnROYW1lID0gaW5wdXQuVmFsdWU7XHJcbiAgICAgICAgICAgIGlmIChuZXdTdHVkZW50TmFtZSA9PSBcIlwiKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgcGxhbi5zdHVkZW50cy5BZGQobmV3IFVzZXIobmV3U3R1ZGVudE5hbWUsIG5ldyBib29sWzVdLCBuZXcgaW50WzVdLCBuZXcgaW50WzVdKSk7XHJcbiAgICAgICAgICAgIEhUTUxFbGVtZW50IGRpdiA9IEdpZChcInN0dWRlbnRzXCIpO1xyXG5cclxuICAgICAgICAgICAgSFRNTERpdkVsZW1lbnQgY2FyZCA9IG5ldyBIVE1MRGl2RWxlbWVudCgpO1xyXG4gICAgICAgICAgICBjYXJkLkNsYXNzTmFtZSA9IFwiY2FyZCBjYXJkLWJvZHlcIjtcclxuICAgICAgICAgICAgY2FyZC5Jbm5lckhUTUwgKz0gXCI8cD48c3Ryb25nPlwiICsgbmV3U3R1ZGVudE5hbWUgKyBcIjwvc3Ryb25nPjwvcD5cIjtcclxuICAgICAgICAgICAgSFRNTEJ1dHRvbkVsZW1lbnQgc2V0SG91cnMgPSBuZXcgSFRNTEJ1dHRvbkVsZW1lbnQoKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuTmFtZSA9IChwbGFuLnRlYWNoZXJzLkNvdW50IC0gMSkuVG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuQ2xhc3NOYW1lID0gXCJidG4gYnRuLXByaW1hcnkgdGVhY2hlci1jbGlja1wiO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5TZXRBdHRyaWJ1dGUoXCJkYXRhLXRvZ2dsZVwiLCBcIm1vZGFsXCIpO1xyXG4gICAgICAgICAgICBzZXRIb3Vycy5TZXRBdHRyaWJ1dGUoXCJkYXRhLXRhcmdldFwiLCBcIiNzZXRIb3Vyc1N0dWRlbnRNb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuSW5uZXJIVE1MID0gXCJOYXN0YXZpdCBob2RpbnlcIjtcclxuICAgICAgICAgICAgY2FyZC5BcHBlbmRDaGlsZChzZXRIb3Vycyk7XHJcbiAgICAgICAgICAgIGRpdi5BcHBlbmRDaGlsZChjYXJkKTtcclxuXHJcbiAgICAgICAgICAgIGlucHV0LlZhbHVlID0gXCJcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgVGVhY2hlckVkaXRIb3Vyc0NsaWNrKG9iamVjdCBzZW5kZXIpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgU3R1ZGVudEVkaXRIb3Vyc0NsaWNrKG9iamVjdCBzZW5kZXIpXHJcbiAgICAgICAge1xyXG5cclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIEhUTUxFbGVtZW50IEdpZChzdHJpbmcgaWQpIHtyZXR1cm4gRG9jdW1lbnQuR2V0RWxlbWVudEJ5SWQoaWQpO31cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBIVE1MRWxlbWVudFtdIEdjbChzdHJpbmcgY2xzKSB7cmV0dXJuIFN5c3RlbS5MaW5xLkVudW1lcmFibGUuVG9BcnJheTxnbG9iYWw6OkJyaWRnZS5IdG1sNS5IVE1MRWxlbWVudD4oRG9jdW1lbnQuR2V0RWxlbWVudHNCeUNsYXNzTmFtZShjbHMpKTt9XHJcbiAgICB9XHJcbn0iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpY1xyXG57XHJcbiAgICBjbGFzcyBQbGFuXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIExpc3Q8VXNlcj4gc3R1ZGVudHM7XHJcbiAgICAgICAgcHVibGljIExpc3Q8VXNlcj4gdGVhY2hlcnM7XHJcblxyXG4gICAgICAgIHB1YmxpYyBQbGFuKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0dWRlbnRzID0gbmV3IExpc3Q8VXNlcj4oKTtcclxuICAgICAgICAgICAgdGVhY2hlcnMgPSBuZXcgTGlzdDxVc2VyPigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG9iamVjdCBDYWxjKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBOb3RJbXBsZW1lbnRlZEV4Y2VwdGlvbigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpY1xyXG57XHJcbiAgICBjbGFzcyBVc2VyXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBob3VyTGVuZ3RoID0gNDU7XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgbmFtZTtcclxuICAgICAgICBwdWJsaWMgYm9vbFtdIGRheXNBdmFpbGFibGU7XHJcbiAgICAgICAgcHVibGljIGludFtdIG1pbnV0ZXNGcm9tQXZhaWxhYmxlO1xyXG4gICAgICAgIHB1YmxpYyBpbnRbXSBtaW51dGVzVG9BdmFpbGFibGU7XHJcbiAgICAgICAgcHVibGljIGJvb2xbXSBhdmFpbGFibGVNaW51dGVzO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgYXNzaWduZWRDb252ZXJ0ZWRNaW51dGVzRnJvbTtcclxuXHJcbiAgICAgICAgcHVibGljIFVzZXIoc3RyaW5nIG5hbWUsIGJvb2xbXSBkYXlzQXZhaWxhYmxlLCBpbnRbXSBtaW51dGVzRnJvbUF2YWlsYWJsZSwgaW50W10gbWludXRlc1RvQXZhaWxhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICAgICAgdGhpcy5kYXlzQXZhaWxhYmxlID0gZGF5c0F2YWlsYWJsZTtcclxuICAgICAgICAgICAgdGhpcy5taW51dGVzRnJvbUF2YWlsYWJsZSA9IG1pbnV0ZXNGcm9tQXZhaWxhYmxlO1xyXG4gICAgICAgICAgICB0aGlzLm1pbnV0ZXNUb0F2YWlsYWJsZSA9IG1pbnV0ZXNUb0F2YWlsYWJsZTtcclxuICAgICAgICAgICAgYXNzaWduZWRDb252ZXJ0ZWRNaW51dGVzRnJvbSA9IDA7XHJcbiAgICAgICAgICAgIGF2YWlsYWJsZU1pbnV0ZXMgPSBuZXcgYm9vbFs2MCAqIDI0XTtcclxuXHJcbiAgICAgICAgICAgIC8vIEZvciBhbGwgZGF5c1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDU7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFkYXlzQXZhaWxhYmxlW2ldKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEdvIGZvciBldmVyeSA1IG1pbnV0ZXNcclxuICAgICAgICAgICAgICAgIGludCBjID0gMDtcclxuICAgICAgICAgICAgICAgIGZvciAoaW50IG0gPSAwOyBtIDwgNjAgKiAyNDsgbSArPSA1KVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBjdXJyZW50bWludXRlID0gaSAqIDI0ICogNjA7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1pbnV0ZXNGcm9tQXZhaWxhYmxlW2ldIDw9IGN1cnJlbnRtaW51dGUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWludXRlc1RvQXZhaWxhYmxlW2ldID49IGN1cnJlbnRtaW51dGUgKyBob3VyTGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVNaW51dGVzW2NdID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBjKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl0KfQo=
