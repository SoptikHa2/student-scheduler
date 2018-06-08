/**
 * @version 1.0.0.0
 * @copyright Copyright ©  2017
 * @compiler Bridge.NET 16.6.1
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
                buts[i].onclick = Bridge.fn.combine(buts[i].onclick, function (e) {
                    StudentScheduler.App.EditHoursClick(buts[i], true);
                });
            }

            buts = StudentScheduler.App.Gcl("student-click");
            for (var i1 = 0; i1 < buts.length; i1 = (i1 + 1) | 0) {
                buts[i1].onclick = Bridge.fn.combine(buts[i1].onclick, function (e) {
                    StudentScheduler.App.EditHoursClick(buts[i1], false);
                });
            }

            buts = StudentScheduler.App.Gcl("but-time-set");
            for (var i2 = 0; i2 < buts.length; i2 = (i2 + 1) | 0) {
                var c = { v : i2 };
                buts[i2].onclick = Bridge.fn.combine(buts[i2].onclick, (function ($me, c) {
                    return function (e) {
                        StudentScheduler.App.SomeDayEditHoursClick(buts[c.v]);
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

            StudentScheduler.App.Gid("run").onclick = function (e) {
                StudentScheduler.App.plan.Calc();
                StudentScheduler.App.Gid("output").innerHTML = StudentScheduler.App.plan.GenerateHTML();
            };

            // Test
            StudentScheduler.App.Gid("test").onclick = function (e) {
                /* plan.teachers.Add(new User("Test Teacher", new bool[] { true, false, true, false, false }, new int[] { 12 * 60, 0, 14 * 60, 0, 0 }, new int[] { 20 * 60, 0, 19 * 60, 0, 0 }));

                plan.students.Add(new User("Student 1", new bool[] { true, false, false, false, false }, new int[] { 15 * 60, 0, 0, 0, 0 }, new int[] { 16 * 60, 0, 0, 0, 0 }));
                plan.students.Add(new User("Student 2", new bool[] { true, false, false, false, false }, new int[] { 11 * 60, 0, 0, 0, 0 }, new int[] {18 * 60, 0, 0, 0, 0 }));
                plan.students.Add(new User("Student 3", new bool[] { true, false, false, false, false }, new int[] { 12 * 60, 0, 0, 0, 0 }, new int[] { 14 * 60, 0, 0, 0, 0 }));
                plan.students.Add(new User("Student 4", new bool[] { true, false, false, false, false }, new int[] { 0, 0, 0, 0, 0 }, new int[] { 23 * 60 + 59, 0, 0, 0, 0 }));
                */

                /* plan.teachers.Add(new User("Test Teacher", new bool[] { true, false, false, false, false }, new int[] { 10 * 60, 0, 0, 0, 0 }, new int[] { 12 * 60, 0, 0, 0, 0 }));

                plan.students.Add(new User("Student 2", new bool[] { true, false, false, false, false }, new int[] { 10 * 60, 0, 0, 0, 0 }, new int[] { 12 * 60, 0, 0, 0, 0 }));
                plan.students.Add(new User("Student 1", new bool[] { true, false, false, false, false }, new int[] { 10 * 60 + 10, 0, 0, 0, 0 }, new int[] { 11 * 60 + 50, 0, 0, 0, 0 }));
                */
                StudentScheduler.App.plan.Calc();
                StudentScheduler.App.Gid("output").innerHTML = StudentScheduler.App.plan.GenerateHTML();
            };

            StudentScheduler.Log.InitializeWithDiv(Bridge.as(StudentScheduler.App.Gid("logDiv"), HTMLDivElement));
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

                    // Allow only one teacher
                    StudentScheduler.App.Gid("add-new-teacher-modal-button").remove();
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
                    setHours.name = (((StudentScheduler.App.plan.students.Count - 1) | 0)).toString();
                    setHours.className = "btn btn-primary teacher-click";
                    setHours.setAttribute("data-toggle", "modal");
                    setHours.setAttribute("data-target", "#setHoursModal");
                    setHours.innerHTML = "Nastavit hodiny";
                    setHours.onclick = Bridge.fn.combine(setHours.onclick, function (e) {
                        StudentScheduler.App.EditHoursClick(setHours, false);
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
                    try {
                        var collection = StudentScheduler.App.lastSetWasTeacher ? StudentScheduler.App.plan.teachers : StudentScheduler.App.plan.students;

                        var from = ((Bridge.Int.mul(System.Int32.parse((Bridge.as(StudentScheduler.App.Gid("get-time-from-hh"), HTMLInputElement)).value), 60) + System.Int32.parse((Bridge.as(StudentScheduler.App.Gid("get-time-from-mm"), HTMLInputElement)).value)) | 0);
                        var to = ((Bridge.Int.mul(System.Int32.parse((Bridge.as(StudentScheduler.App.Gid("get-time-to-hh"), HTMLInputElement)).value), 60) + System.Int32.parse((Bridge.as(StudentScheduler.App.Gid("get-time-to-mm"), HTMLInputElement)).value)) | 0);

                        if (((from + StudentScheduler.AppLogic.Plan.lessonLength) | 0) > to) {
                            StudentScheduler.App.RemoveHourInDay();
                            return;
                        }

                        ($t = collection.getItem(StudentScheduler.App.lastSetId).minutesFromAvailable)[System.Array.index(StudentScheduler.App.dayId, $t)] = from;
                        ($t1 = collection.getItem(StudentScheduler.App.lastSetId).minutesToAvailable)[System.Array.index(StudentScheduler.App.dayId, $t1)] = to;
                    }
                    catch ($e1) {
                        $e1 = System.Exception.create($e1);
                    }
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

                    // Set to all days: if there is at least {Plan.lessonLength} (50) minutes between two times: return times in format ["HH:MM - HH:MM"], else, return "Není nastaveno"
                    for (var i = 0; i < 5; i = (i + 1) | 0) {
                        StudentScheduler.App.Gid("set-time-" + (StudentScheduler.App.days[System.Array.index(i, StudentScheduler.App.days)] || "")).innerHTML = ((($t = collection.getItem(StudentScheduler.App.lastSetId).minutesToAvailable)[System.Array.index(i, $t)] - ($t1 = collection.getItem(StudentScheduler.App.lastSetId).minutesFromAvailable)[System.Array.index(i, $t1)]) | 0) < StudentScheduler.AppLogic.Plan.lessonLength ? "Není nastaveno" : (StudentScheduler.App.MinutesToHoursAndMinutes(($t2 = collection.getItem(StudentScheduler.App.lastSetId).minutesFromAvailable)[System.Array.index(i, $t2)]) || "") + " - " + (StudentScheduler.App.MinutesToHoursAndMinutes(($t3 = collection.getItem(StudentScheduler.App.lastSetId).minutesToAvailable)[System.Array.index(i, $t3)]) || "");
                    }
                },
                MinutesToHoursAndMinutes: function (minutes) {
                    var hours = Bridge.Int.clip32(Math.floor(minutes / 60.0));
                    return (System.Int32.format(hours, "00") || "") + ":" + (System.Int32.format((((minutes - Bridge.Int.mul(hours, 60)) | 0)), "00") || "");
                },
                MyNumberToStringWithAtLeastTwoDigitsFormat: function (number) {
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
                    return document.body.getElementsByClassName(cls);
                }
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.BruteForcedStudent", {
        $kind: "struct",
        statics: {
            methods: {
                getDefaultValue: function () { return new StudentScheduler.AppLogic.BruteForcedStudent(); }
            }
        },
        fields: {
            minutesFrom: 0,
            student: null
        },
        ctors: {
            $ctor1: function (minutesFrom, student) {
                this.$initialize();
                this.minutesFrom = minutesFrom;
                this.student = student;
            },
            ctor: function () {
                this.$initialize();
            }
        },
        methods: {
            getHashCode: function () {
                var h = Bridge.addHash([6973949932, this.minutesFrom, this.student]);
                return h;
            },
            equals: function (o) {
                if (!Bridge.is(o, StudentScheduler.AppLogic.BruteForcedStudent)) {
                    return false;
                }
                return Bridge.equals(this.minutesFrom, o.minutesFrom) && Bridge.equals(this.student, o.student);
            },
            $clone: function (to) {
                var s = to || new StudentScheduler.AppLogic.BruteForcedStudent();
                s.minutesFrom = this.minutesFrom;
                s.student = this.student;
                return s;
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.NetworkFlow.Edge", {
        fields: {
            Capacity: 0,
            currentFlow: 0,
            From: null,
            To: null
        },
        ctors: {
            ctor: function (capacity, currentFlow, from, to) {
                this.$initialize();
                this.Capacity = capacity;
                this.currentFlow = currentFlow;
                this.From = from;
                this.To = to;
            }
        },
        methods: {
            GetCurrentFlow: function (currentPath, flow, info) {
                return this.currentFlow;
            },
            SetCurrentFlow: function (newValue) {
                this.currentFlow = newValue;
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.NetworkFlow.Flow", {
        fields: {
            Nodes: null,
            teacher: null,
            students: null
        },
        ctors: {
            ctor: function (teacher, students) {
                this.$initialize();
                this.teacher = teacher;
                this.students = students;
                this.Nodes = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.NetworkFlow.Node)).ctor();
            }
        },
        methods: {
            DEBUG_ClearNodes: function () {
                this.Nodes.clear();
            },
            /**
             * Gets result using flows. This method will set student assigned times and return array of minutes, when is break time each day
             *
             * @instance
             * @public
             * @this StudentScheduler.AppLogic.NetworkFlow.Flow
             * @memberof StudentScheduler.AppLogic.NetworkFlow.Flow
             * @return  {Array.<number>}
             */
            GetResult: function () {
                var $t;
                var breaks = System.Array.init(5, 0, System.Int32);

                for (var day = 0; day < 5; day = (day + 1) | 0) {
                    StudentScheduler.Log.Write(System.String.format("===================DAY: {0}==============", [Bridge.box(day, System.Int32)]), StudentScheduler.Log.Severity.Info);
                    this.BuildGraph(day);
                    this.Start();
                    StudentScheduler.Log.Write("Done...", StudentScheduler.Log.Severity.Info);
                    var studentsToday = this.GetResultFromGraph(day);
                    // If there are more then three students today:
                    if (studentsToday.Count > 3) {
                        // Save first three student times
                        for (var i = 0; i < 3; i = (i + 1) | 0) {
                            this.ApplyStudent(studentsToday.getItem(i).$clone());
                        }
                        // Disable minutes and record break time
                        breaks[System.Array.index(day, breaks)] = (studentsToday.getItem(2).$clone().timeStart + 50) | 0;
                        // Start again (remove first two students and their times)
                        this.BuildGraph(day, breaks[System.Array.index(day, breaks)], ((breaks[System.Array.index(day, breaks)] + StudentScheduler.AppLogic.Plan.breakAfterLessonsLength) | 0));
                        this.Start();
                        studentsToday = this.GetResultFromGraph(day);
                    } else {
                        breaks[System.Array.index(day, breaks)] = 2147483647;
                    }

                    // Apply all students
                    $t = Bridge.getEnumerator(studentsToday);
                    try {
                        while ($t.moveNext()) {
                            var result = $t.Current.$clone();
                            this.ApplyStudent(result.$clone());
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }}

                StudentScheduler.Log.Write("Break: " + (Bridge.toArray(breaks).join(", ") || ""), StudentScheduler.Log.Severity.Info);

                return breaks;
            },
            BuildGraph: function (day, bannedTimespanFrom, bannedTimespanTo) {
                var $t, $t1, $t2, $t3;
                if (bannedTimespanFrom === void 0) { bannedTimespanFrom = -1; }
                if (bannedTimespanTo === void 0) { bannedTimespanTo = -1; }
                this.Nodes.clear();
                // Add root node
                var root = new StudentScheduler.AppLogic.NetworkFlow.Node("Input", -1, StudentScheduler.AppLogic.NetworkFlow.Node.NodeType.Input);
                this.Nodes.add(root);

                // Add all students nodes
                $t = Bridge.getEnumerator(this.students);
                try {
                    while ($t.moveNext()) {
                        var student = $t.Current;
                        if (student.assigned || !student.daysAvailable[System.Array.index(day, student.daysAvailable)]) {
                            continue;
                        }

                        // TODO: Error when multiple students with same name
                        var studentNode = new StudentScheduler.AppLogic.NetworkFlow.Node("Student:" + (student.name || ""), -1, StudentScheduler.AppLogic.NetworkFlow.Node.NodeType.Default);
                        this.AddNodeAfter("Input", studentNode);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }
                // Prepare time chunk node
                var timeChunk = new StudentScheduler.AppLogic.NetworkFlow.Node("TimeChunk", -1, StudentScheduler.AppLogic.NetworkFlow.Node.NodeType.Default);

                var occupiedTimesToday = System.Linq.Enumerable.from(this.students).where(function (student1) {
                        return student1.assignedDay === day;
                    }).select(function (student1) {
                    return student1.assignedMinutes;
                });

                // Add all times nodes
                for (var time = 0; time < 1440; time = (time + 5) | 0) {
                    // If the time is banned or someone already positioned used the time, skip to next time
                    if ((time >= bannedTimespanFrom && time <= bannedTimespanTo) || occupiedTimesToday.where(function (occTime) {
                        return Math.abs(((occTime - time) | 0)) < 50;
                    }).count() > 0) {
                        continue;
                    }

                    if (($t1 = this.teacher.minutesFromAvailable)[System.Array.index(day, $t1)] <= time && ((($t2 = this.teacher.minutesToAvailable)[System.Array.index(day, $t2)] - StudentScheduler.AppLogic.Plan.lessonLength) | 0) >= time) {

                        var studentsAtThisTime = System.Linq.Enumerable.from(this.students).where(function (student1) {
                                return !student1.assigned && student1.daysAvailable[System.Array.index(day, student1.daysAvailable)] && student1.minutesFromAvailable[System.Array.index(day, student1.minutesFromAvailable)] <= time && ((student1.minutesToAvailable[System.Array.index(day, student1.minutesToAvailable)] - StudentScheduler.AppLogic.Plan.lessonLength) | 0) >= time;
                            });

                        var timeNode = new StudentScheduler.AppLogic.NetworkFlow.Node("Time:" + time, time, StudentScheduler.AppLogic.NetworkFlow.Node.NodeType.Default);
                        $t3 = Bridge.getEnumerator(studentsAtThisTime);
                        try {
                            while ($t3.moveNext()) {
                                var student1 = $t3.Current;
                                this.AddNodeAfter("Student:" + (student1.name || ""), timeNode);
                            }
                        } finally {
                            if (Bridge.is($t3, System.IDisposable)) {
                                $t3.System$IDisposable$dispose();
                            }
                        }this.AddNodeAfter("Time:" + time, timeChunk);
                    }
                }

                // Connect Time Chunk with output
                var output = new StudentScheduler.AppLogic.NetworkFlow.Node("Output", -1, StudentScheduler.AppLogic.NetworkFlow.Node.NodeType.Output);
                this.AddNodeAfter("TimeChunk", output);

                // Change edge between TimeChunk(Node) and Output to TimeChunk(Edge)
                var timeChunkEdge = new StudentScheduler.AppLogic.NetworkFlow.TimeChunk(timeChunk, output);
                timeChunk.OutputEdges.clear();
                timeChunk.OutputEdges.add(timeChunkEdge);
                output.InputEdges.clear();
                output.InputEdges.add(timeChunkEdge);
            },
            AddNodeAfter: function (identifier, newNode) {
                var $t;
                $t = Bridge.getEnumerator(this.Nodes);
                try {
                    while ($t.moveNext()) {
                        var node = $t.Current;
                        if (Bridge.referenceEquals(node.Identifier, identifier)) {
                            var newEdge = new StudentScheduler.AppLogic.NetworkFlow.Edge(1, 0, node, newNode);
                            node.OutputEdges.add(newEdge);
                            newNode.InputEdges.add(newEdge);
                            break;
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }if (!this.Nodes.contains(newNode)) {
                    this.Nodes.add(newNode);
                }
            },
            Start: function () {
                // While we are creating new flow, keep doing it
                while (this.CreateNewFlow()) {
                    ;
                }
            },
            OLD_CreateNewFlow: function () {
                var $t, $t1, $t2;
                // Let's create dictionary of Node : SourceNode
                //  +----+----+----+-----+-----+
                //  | A1 | A2 | B1 | TCH | OUT | 
                //  +----+----+----+-----+-----+
                //  | I  | I  | A1 | B1  | TCH |
                //  +----+----+----+-----+-----+

                var FlowPath = new (System.Collections.Generic.Dictionary$2(StudentScheduler.AppLogic.NetworkFlow.Node, StudentScheduler.AppLogic.NetworkFlow.Node))();
                for (var i = 1; i < this.Nodes.Count; i = (i + 1) | 0) {
                    FlowPath.add(this.Nodes.getItem(i), null);
                } // Add all nodes into FlowPath !except for root node

                var NodesToProcess = new (System.Collections.Generic.Queue$1(StudentScheduler.AppLogic.NetworkFlow.Node)).ctor();
                NodesToProcess.enqueue(this.Nodes.getItem(0)); // Mark root node as to-process

                var AlreadyAddedNodes = new (System.Collections.Generic.HashSet$1(StudentScheduler.AppLogic.NetworkFlow.Node)).ctor();
                AlreadyAddedNodes.add(this.Nodes.getItem(0));
                while (NodesToProcess.Count > 0) {
                    // Get all nodes that still have avaiable flow space in them and aren't occupied (in FlowPath)
                    var node = NodesToProcess.dequeue();

                    // Nodes that are accessable from this node
                    var avaiableNodes = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.NetworkFlow.Node)).$ctor2(((node.OutputEdges.Count + node.InputEdges.Count) | 0));

                    var doInputEdges = true;
                    var areInputEdgesForbidden = false;
                    var renderedPath = this.RenderPath(System.Linq.Enumerable.from(this.Nodes).first(), node, FlowPath);
                    $t = Bridge.getEnumerator(node.OutputEdges);
                    try {
                        while ($t.moveNext()) {
                            var outputEdge = { v : $t.Current };
                            // Kdyz jdu dopredu, musim zkontrolovat, jestli tenhle timeNode neni v rozmezi 50 minut od neceho, cim jsem prosel
                            if (outputEdge.v.To.Value !== -1 && System.Linq.Enumerable.from(renderedPath).where((function ($me, outputEdge) {
                                    return function (n) {
                                        return n.Value !== -1 && Math.abs(((outputEdge.v.To.Value - n.Value) | 0)) < StudentScheduler.AppLogic.Plan.lessonLength;
                                    };
                                })(this, outputEdge)).count() > 0) {
                                StudentScheduler.Log.Write("I've skipped outputEdge with [toNode]: " + (outputEdge.v.To.Identifier || ""), StudentScheduler.Log.Severity.Critical);
                                continue;
                            }

                            var flow = outputEdge.v.GetCurrentFlow(renderedPath, this, "OutputEdges");
                            if (flow > 1) {
                                areInputEdgesForbidden = true;
                            }
                            if (flow === 0) {
                                avaiableNodes.add(outputEdge.v.To);
                                doInputEdges = false;
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }if (doInputEdges && !areInputEdgesForbidden) {
                        $t1 = Bridge.getEnumerator(node.InputEdges);
                        try {
                            while ($t1.moveNext()) {
                                var inputEdge = $t1.Current;
                                // If this possible node is within 50-mintue range within another node in path, skip this
                                /* if (inputEdge.From.Value != -1 && renderedPath.Where(n => n.Value != -1 && Math.Abs(n.Value - inputEdge.From.Value) < Plan.lessonLength).Count() > 0)
                                   continue;*/ // Tohle nic neresi

                                // RESENI: Tohle budu prochazet, JENOM kdyz nenajdu zadnou cestu pomoci OutputEdge //TODO: Mozne nefunkcni pro neco?
                                // Budu hledat cestu JENOM mezi hranami grafu, do kterych MUZE ten student, ktery ma cestu, kterou mu kradu; jit.

                                // Sem se dostanu jenom v pripade, ze vsechny OutputNody z TimeChunku(Node) jsou odmitnuty -> [node] je vzdy TimeChunk

                                if (!Bridge.referenceEquals(node.Identifier, "TimeChunk")) {
                                    StudentScheduler.Log.Write(System.String.format("!!! NODE ISN'T TIME CHUNK !!! \"{0}\" ({1})", node.Identifier, Bridge.box(node.Value, System.Int32)), StudentScheduler.Log.Severity.Critical);
                                }

                                // Najdu si studenta, ktery ho blokuje a najdu mu jinou cestu.
                                // Tenhle novyStudent si vezme cestu stareho studenta (^^)



                                if (Bridge.is(inputEdge, StudentScheduler.AppLogic.NetworkFlow.TimeChunk)) {
                                    StudentScheduler.Log.Write("I found input edge that was Time Chunk; from = " + (inputEdge.To.Identifier || ""), StudentScheduler.Log.Severity.Warning);
                                }

                                // Why?
                                if (renderedPath.Count >= 2 && Bridge.referenceEquals(inputEdge.From, renderedPath.getItem(((renderedPath.Count - 2) | 0)))) {
                                    continue;
                                }

                                var flow1 = inputEdge.GetCurrentFlow(renderedPath, this, "InputEdges");
                                if (flow1 === 1) {
                                    avaiableNodes.add(inputEdge.From);
                                    StudentScheduler.Log.Write("I just used backflow. Here's full path: " + (Bridge.toArray(System.Linq.Enumerable.from(renderedPath).select(function (n) {
                                                return System.String.format("\"{0}\"({1})", n.Identifier, Bridge.box(n.Value, System.Int32));
                                            })).join(" , ") || "") + ". The new node is \"" + (inputEdge.From.Identifier || "") + "\"(" + inputEdge.From.Value + ")", StudentScheduler.Log.Severity.Critical);
                                }


                            }
                        } finally {
                            if (Bridge.is($t1, System.IDisposable)) {
                                $t1.System$IDisposable$dispose();
                            }
                        }}

                    // Fill all nodes that are accessible from this node
                    $t2 = Bridge.getEnumerator(avaiableNodes);
                    try {
                        while ($t2.moveNext()) {
                            var nodeToGoThrough = $t2.Current;
                            if (AlreadyAddedNodes.contains(nodeToGoThrough)) {
                                continue;
                            }

                            AlreadyAddedNodes.add(nodeToGoThrough);
                            FlowPath.set(nodeToGoThrough, node);
                            NodesToProcess.enqueue(nodeToGoThrough);
                        }
                    } finally {
                        if (Bridge.is($t2, System.IDisposable)) {
                            $t2.System$IDisposable$dispose();
                        }
                    }}

                // Now, I (probably) have flow
                StudentScheduler.Log.Write(this.toString(), StudentScheduler.Log.Severity.Info);
                this.DEBUG_WriteFlowPath(FlowPath);
                var TimeChunk = System.Linq.Enumerable.from(FlowPath.getKeys()).where(function (x) {
                        return Bridge.referenceEquals(x.Identifier, "TimeChunk");
                    }).singleOrDefault(null, null);
                if (TimeChunk == null || FlowPath.get(TimeChunk) == null) {
                    StudentScheduler.Log.Write("No flow", StudentScheduler.Log.Severity.Info);
                    // No flow
                    return false;
                } else {
                    StudentScheduler.Log.Write("Applying flow", StudentScheduler.Log.Severity.Info);
                    this.ApplyFlow(System.Linq.Enumerable.from(this.Nodes).first(), TimeChunk, FlowPath);
                    return true;
                }

                /* // First of all, we have to create the dictionary, so we know, what the path is
                Dictionary<Node, Node> FlowPath = new Dictionary<Node, Node>();
                // Populate the dictionary with nodes
                foreach (Node node in Nodes) FlowPath.Add(node, null);

                // Here, we create Queue, that holds nodes, that we will want to work with
                // Plus list of nodes which were already added to Queue, so we don't process one node multiple times
                Queue<Node> nodesToProcess = new Queue<Node>();
                // And let's enqueue root node
                nodesToProcess.Enqueue(Nodes[0]);
                // Here's the list of added nodes
                HashSet<Node> alreadyAddedNodes = new HashSet<Node>();
                // And add the root node
                alreadyAddedNodes.Add(Nodes[0]);

                // Now we build the flow: 

                // While we have something to process in queue, select the node...
                while(nodesToProcess.Count > 0)
                {
                   Node nodeToProcess = nodesToProcess.Dequeue();

                   // TODO: The paths used in edge.GetCurrentFlow do NOT contain the current node -> problem?

                   // First of all, save current path from this node to input, inverted. This is used to calculate flow through time chunk edges
                   List<Node> path = RenderPath(Nodes[0], nodeToProcess, FlowPath);
                   // What we do here? Get collection of edges that goes from this node
                   var edgesFromThisNode = nodeToProcess.OutputEdges.Where(edge => FlowPath[edge.To] == null && edge.GetCurrentFlow(path, this, "Getting output edges") == 0);
                   // Now, we get edges from this node to it's inputs, but not the inputs that we already went through. 
                   var edgesToThisNode = nodeToProcess.InputEdges.Where(edge => FlowPath[edge.From] == null && !path.Contains(edge.From) && edge.GetCurrentFlow(path, this, "Getting input edges") == 1);

                   // Add the nodes we got into FlowPath
                   edgesFromThisNode.ForEach(edge => FlowPath[edge.To] = nodeToProcess);
                   edgesToThisNode.ForEach(edge => FlowPath[edge.From] = nodeToProcess);

                   // Add these nodes to to-process list
                   edgesFromThisNode.ForEach(edge => nodesToProcess.Enqueue(edge.To));
                   edgesFromThisNode.ForEach(edge => nodesToProcess.Enqueue(edge.From));
                }

                // Now, we may have the flow
                // Just check the output
                Node output = Nodes.Where(node => node.Identifier == "Output").Single();
                // If the output has something in FlowPath, we have flow!
                if(FlowPath[output] != null)
                {
                   // Apply flow
                   ApplyFlow(Nodes.First(), output, FlowPath);
                   return true;
                }
                else
                {
                   return false;
                }*/
            },
            CreateNewFlow: function () {
                var $t, $t1;
                // First of all, let's create a dictionary, when we'll store currently chosen path
                var NodesPath = new (System.Collections.Generic.Dictionary$2(StudentScheduler.AppLogic.NetworkFlow.Node,StudentScheduler.AppLogic.NetworkFlow.Node))();
                // Add keys and null
                this.Nodes.forEach(function (node) {
                    NodesPath.add(node, null);
                });

                // Let's start processing nodes
                var nodesToProcess = new (System.Collections.Generic.Queue$1(StudentScheduler.AppLogic.NetworkFlow.Node)).ctor();
                var alreadyProcessedNodes = new (System.Collections.Generic.HashSet$1(StudentScheduler.AppLogic.NetworkFlow.Node)).ctor();
                nodesToProcess.enqueue(this.Nodes.getItem(0));
                alreadyProcessedNodes.add(this.Nodes.getItem(0));

                // While there's something to process, process it
                while (nodesToProcess.Count > 0) {
                    // Start by getting node from the queue
                    var node = nodesToProcess.dequeue();
                    // And get current path
                    var path = { v : this.RenderPath(this.Nodes.getItem(0), node, NodesPath) };
                    StudentScheduler.Log.Write(Bridge.toArray(System.Linq.Enumerable.from(path.v).select(function (x) {
                                return x.Identifier;
                            })).join(" -> "), StudentScheduler.Log.Severity.Info); // Debug: write currently rendered path
                    // Now we need to get next nodes from this node...
                    var nextNodes = System.Linq.Enumerable.from(node.OutputEdges).where((function ($me, path) {
                            return Bridge.fn.bind($me, function (edge) {
                                return edge.GetCurrentFlow(path.v, this, "Getting output nodes") === 0;
                            });
                        })(this, path));
                    // And get previous nodes
                    var previousNodes = System.Linq.Enumerable.from(node.InputEdges).where((function ($me, path) {
                            return Bridge.fn.bind($me, function (edge) {
                                return edge.GetCurrentFlow(path.v, this, "Getting input nodes") === 1;
                            });
                        })(this, path));
                    // Filter the nodes to only allow those that are not in alreadyProcessedNodes
                    nextNodes = nextNodes.where(function (newNode) {
                        return !alreadyProcessedNodes.contains(newNode.To);
                    });
                    previousNodes = previousNodes.where(function (newNode) {
                        return !alreadyProcessedNodes.contains(newNode.From);
                    });
                    // Add all these nodes to queue, list of processed nodes and the dictionary
                    $t = Bridge.getEnumerator(nextNodes.select(function (edge) {
                        return edge.To;
                    }).union(previousNodes.select(function (edge) {
                        return edge.From;
                    })));
                    try {
                        while ($t.moveNext()) {
                            var newNode = $t.Current;
                            nodesToProcess.enqueue(newNode);
                            alreadyProcessedNodes.add(newNode);
                            NodesPath.set(newNode, node);
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }
                    try {
                        StudentScheduler.Log.Write(nodesToProcess.peek(), StudentScheduler.Log.Severity.Info);
                        StudentScheduler.Log.Write(Bridge.box(NodesPath.get(nodesToProcess.peek()) == null, System.Boolean, System.Boolean.toString), StudentScheduler.Log.Severity.Info);
                        StudentScheduler.Log.Write(($t1 = NodesPath.get(nodesToProcess.peek())) != null ? $t1.Identifier : null, StudentScheduler.Log.Severity.Info);
                    }
                    catch ($e1) {
                        $e1 = System.Exception.create($e1);
                    }
                }

                StudentScheduler.Log.Write(this.toString(), StudentScheduler.Log.Severity.Info);
                this.DEBUG_WriteFlowPath(NodesPath);
                // If there is flow going through output, there is flow
                var output = System.Linq.Enumerable.from(NodesPath.getKeys()).where(function (x) {
                        return Bridge.referenceEquals(x.Identifier, "Output");
                    }).singleOrDefault(null, null);
                if (output == null || NodesPath.get(output) == null) {
                    // No flow
                    StudentScheduler.Log.Write("No flow", StudentScheduler.Log.Severity.Info);
                    return false;
                } else {
                    // Apply flow
                    StudentScheduler.Log.Write("Applying flow", StudentScheduler.Log.Severity.Info);
                    this.NewFlowApply(this.RenderPath(this.Nodes.getItem(0), output, NodesPath));
                    return true;
                }
            },
            NewFlowApply: function (path) {
                for (var i = 0; i < ((System.Linq.Enumerable.from(path).count() - 1) | 0); i = (i + 1) | 0) {
                    // Select node:nextNode
                    var prevNode = path.getItem(i);
                    var nextNode = { v : path.getItem(((i + 1) | 0)) };

                    // Now set the edge between them to the opposite value
                    var edgeBetweenNodes = System.Linq.Enumerable.from(prevNode.OutputEdges).union(prevNode.InputEdges).where((function ($me, nextNode) {
                        return function (edge) {
                            return Bridge.referenceEquals(edge.From, nextNode.v) || Bridge.referenceEquals(edge.To, nextNode.v);
                        };
                    })(this, nextNode)).single();
                    if (!(Bridge.is(edgeBetweenNodes, StudentScheduler.AppLogic.NetworkFlow.TimeChunk))) {
                        edgeBetweenNodes.SetCurrentFlow(edgeBetweenNodes.GetCurrentFlow(null, null, "Flow Apply") === 0 ? 1 : 0);
                    }
                }
            },
            DEBUG_WriteFlowPath: function (FlowPath) {
                var output = "Keys: " + (Bridge.toArray(System.Linq.Enumerable.from(FlowPath.getKeys()).select(function (x) {
                            return x.Identifier;
                        })).join(" | ") || "");
                output = (output || "") + "\n";
                output = (output || "") + (("Values: " + (Bridge.toArray(System.Linq.Enumerable.from(FlowPath.getValues()).select(function (x) {
                            return x == null ? "---" : x.Identifier;
                        })).join(" | ") || "")) || "");
                StudentScheduler.Log.Write(output, StudentScheduler.Log.Severity.Info);
            },
            RenderPath: function (rootNode, endNode, flowPath) {
                var path = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.NetworkFlow.Node)).ctor();
                path.add(endNode);

                var nextNode = endNode;
                while (!Bridge.referenceEquals(nextNode, rootNode)) {
                    nextNode = flowPath.get(nextNode);
                    path.add(nextNode);
                }

                path.reverse();
                return path;
            },
            GetResultFromGraph: function (day) {
                StudentScheduler.Log.Write("Starting GetResultFromGraph", StudentScheduler.Log.Severity.Info);

                var timeNodes = System.Linq.Enumerable.from(this.Nodes).where(function (node) {
                        return node.Value !== -1;
                    });

                var usedTimeNodes = timeNodes.where(function (node) {
                    return node.InputEdges.Count !== 0;
                });

                StudentScheduler.Log.Write("Time nodes total: " + usedTimeNodes.count(), StudentScheduler.Log.Severity.Info);

                //var edges = usedTimeNodes.Select(node => node.InputEdges.Where(edge => edge.GetCurrentFlow(null, null) == 1).Single());
                var edges = usedTimeNodes.where(function (node) {
                    return System.Linq.Enumerable.from(node.InputEdges).where(function (edge) {
                            return edge.GetCurrentFlow(null, null, "GetResult") === 1;
                        }).count() === 1;
                }).select(function (node) {
                    return System.Linq.Enumerable.from(node.InputEdges).where(function (edge) {
                            return edge.GetCurrentFlow(null, null, "GetREsult2") === 1;
                        }).single();
                });

                StudentScheduler.Log.Write("Time nodes with selected edge: " + edges.count(), StudentScheduler.Log.Severity.Info);

                return edges.select(Bridge.fn.bind(this, function (edge) {
                    var $t;
                    return ($t = new StudentScheduler.AppLogic.NetworkFlow.Flow.AssignmentPreview(), $t.assignedStudent = System.Linq.Enumerable.from(this.students).where(function (student) {
                            var $t1;
                            return Bridge.referenceEquals(student.name, ($t1 = System.String.split(edge.From.Identifier, [58].map(function(i) {{ return String.fromCharCode(i); }})))[System.Array.index(1, $t1)]);
                        }).single(), $t.day = day, $t.timeStart = edge.To.Value, $t);
                })).orderBy(function (result) {
                    return result.timeStart;
                }).toList(StudentScheduler.AppLogic.NetworkFlow.Flow.AssignmentPreview);
            },
            ApplyStudent: function (result) {
                result.assignedStudent.assigned = true;
                result.assignedStudent.assignedDay = result.day;
                result.assignedStudent.assignedMinutes = result.timeStart;
            },
            ApplyFlow: function (rootNode, endNode, flowPath) {
                var nextNode = endNode;
                while (!Bridge.referenceEquals(nextNode, rootNode)) {
                    var edge = this.GetEdgeInfo(nextNode, flowPath.get(nextNode));

                    if (edge.IsFromNode1ToNode2) {
                        edge.ResultEdge.SetCurrentFlow(0);
                        StudentScheduler.Log.Write(System.String.format("Setting edge flow from {0} to {1} to 0", edge.ResultEdge.From.Identifier, edge.ResultEdge.To.Identifier), StudentScheduler.Log.Severity.Warning);
                    } else {
                        edge.ResultEdge.SetCurrentFlow(1);
                        StudentScheduler.Log.Write(System.String.format("Setting edge flow from {0} to {1} to 1", edge.ResultEdge.From.Identifier, edge.ResultEdge.To.Identifier), StudentScheduler.Log.Severity.Info);
                    }

                    nextNode = flowPath.get(nextNode);
                }
            },
            GetEdgeInfo: function (node1, node2) {
                var result = new StudentScheduler.AppLogic.NetworkFlow.Flow.EdgeInfo();
                var edg = System.Linq.Enumerable.from(node1.OutputEdges).where(function (edge) {
                        return Bridge.referenceEquals(edge.To, node2);
                    }).firstOrDefault(null, null);

                result.IsFromNode1ToNode2 = edg != null;

                if (edg == null) {
                    edg = System.Linq.Enumerable.from(node1.InputEdges).where(function (edge) {
                            return Bridge.referenceEquals(edge.From, node2);
                        }).firstOrDefault(null, null);
                }

                result.ResultEdge = edg;

                return result.$clone();
            },
            toString: function () {
                var $t, $t1;
                var command = "graph LR\r\n";

                $t = Bridge.getEnumerator(this.Nodes);
                try {
                    while ($t.moveNext()) {
                        var n = $t.Current;
                        $t1 = Bridge.getEnumerator(n.OutputEdges);
                        try {
                            while ($t1.moveNext()) {
                                var outputEdge = $t1.Current;
                                command = (command || "") + ((System.String.format("{0} -->|{1}| {2}\r\n", outputEdge.From.Identifier, Bridge.box(outputEdge.GetCurrentFlow(System.Array.init(0, null, StudentScheduler.AppLogic.NetworkFlow.Node), this, "ThisToString"), System.Int32), outputEdge.To.Identifier)) || "");
                            }
                        } finally {
                            if (Bridge.is($t1, System.IDisposable)) {
                                $t1.System$IDisposable$dispose();
                            }
                        }
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }

                return command;
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.NetworkFlow.Flow.AssignmentPreview", {
        $kind: "struct",
        statics: {
            methods: {
                getDefaultValue: function () { return new StudentScheduler.AppLogic.NetworkFlow.Flow.AssignmentPreview(); }
            }
        },
        fields: {
            timeStart: 0,
            day: 0,
            assignedStudent: null
        },
        ctors: {
            ctor: function () {
                this.$initialize();
            }
        },
        methods: {
            getHashCode: function () {
                var h = Bridge.addHash([7090130162, this.timeStart, this.day, this.assignedStudent]);
                return h;
            },
            equals: function (o) {
                if (!Bridge.is(o, StudentScheduler.AppLogic.NetworkFlow.Flow.AssignmentPreview)) {
                    return false;
                }
                return Bridge.equals(this.timeStart, o.timeStart) && Bridge.equals(this.day, o.day) && Bridge.equals(this.assignedStudent, o.assignedStudent);
            },
            $clone: function (to) {
                var s = to || new StudentScheduler.AppLogic.NetworkFlow.Flow.AssignmentPreview();
                s.timeStart = this.timeStart;
                s.day = this.day;
                s.assignedStudent = this.assignedStudent;
                return s;
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.NetworkFlow.Flow.EdgeInfo", {
        $kind: "struct",
        statics: {
            methods: {
                getDefaultValue: function () { return new StudentScheduler.AppLogic.NetworkFlow.Flow.EdgeInfo(); }
            }
        },
        fields: {
            ResultEdge: null,
            IsFromNode1ToNode2: false
        },
        ctors: {
            ctor: function () {
                this.$initialize();
            }
        },
        methods: {
            getHashCode: function () {
                var h = Bridge.addHash([3570258574, this.ResultEdge, this.IsFromNode1ToNode2]);
                return h;
            },
            equals: function (o) {
                if (!Bridge.is(o, StudentScheduler.AppLogic.NetworkFlow.Flow.EdgeInfo)) {
                    return false;
                }
                return Bridge.equals(this.ResultEdge, o.ResultEdge) && Bridge.equals(this.IsFromNode1ToNode2, o.IsFromNode1ToNode2);
            },
            $clone: function (to) {
                var s = to || new StudentScheduler.AppLogic.NetworkFlow.Flow.EdgeInfo();
                s.ResultEdge = this.ResultEdge;
                s.IsFromNode1ToNode2 = this.IsFromNode1ToNode2;
                return s;
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.NetworkFlow.Node", {
        fields: {
            Identifier: null,
            Value: 0,
            InputEdges: null,
            OutputEdges: null,
            Type: 0
        },
        ctors: {
            ctor: function (identifier, value, type) {
                this.$initialize();
                this.Identifier = identifier;
                this.Value = value;
                this.Type = type;
                this.InputEdges = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.NetworkFlow.Edge)).ctor();
                this.OutputEdges = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.NetworkFlow.Edge)).ctor();
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.NetworkFlow.Node.NodeType", {
        $kind: "enum",
        statics: {
            fields: {
                Default: 0,
                Input: 1,
                Output: 2
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.Plan", {
        statics: {
            fields: {
                lessonLength: 0,
                breakAfterLessons: 0,
                breakAfterLessonsLength: 0
            },
            ctors: {
                init: function () {
                    this.lessonLength = 50;
                    this.breakAfterLessons = 3;
                    this.breakAfterLessonsLength = 15;
                }
            }
        },
        fields: {
            breakAfterLessonsStart: null,
            students: null,
            teachers: null
        },
        ctors: {
            init: function () {
                this.breakAfterLessonsStart = System.Array.init([2147483647, 2147483647, 2147483647, 2147483647, 2147483647], System.Int32);
            },
            ctor: function () {
                this.$initialize();
                this.students = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.User)).ctor();
                this.teachers = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.User)).ctor();
            }
        },
        methods: {
            GenerateHTML: function () {
                var s = "";

                var notPosStudents = System.Linq.Enumerable.from(this.students).where(function (x) {
                        return !x.assigned;
                    });
                var posStudents = System.Linq.Enumerable.from(this.students).where(function (x) {
                        return x.assigned;
                    });

                if (notPosStudents.count() > 0) {
                    s = (s || "") + (((System.String.format("<div class=\"alert alert-danger alert-dismissible fade show\"role=\"alert\"", null) || "") + (System.String.format("<p>Nepodařilo se najít místo pro {0} z {1} žáků ", Bridge.box(notPosStudents.count(), System.Int32), Bridge.box(this.students.Count, System.Int32)) || "") + (System.String.format("({0})</p>", [notPosStudents.select(function (x) {
                            return x.name;
                        }).toArray(System.String).join(", ")]) || "") + (System.String.format("<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">", null) || "") + (System.String.format("<span aria-hidden=\"true\">×</span></button></div>", null) || "")) || "");
                }

                var days = System.Array.init([
                    "Pondělí", 
                    "Úterý", 
                    "Středa", 
                    "Čtvrtek", 
                    "Pátek"
                ], System.String);

                for (var day = 0; day < 5; day = (day + 1) | 0) {
                    var possedStudentsToday = 0;

                    s = (s || "") + ((System.String.format("<div class=\"row\"><div class=\"card card-body\"><h3>{0}</h3>", [days[System.Array.index(day, days)]])) || "");
                    // <div class="card card-body">Petr (10:00 - 10:50)</div>

                    var pssday = posStudents.where(function (x) {
                        return x.assignedDay === day;
                    }).orderBy(function (x) {
                        return x.assignedMinutes;
                    }).toArray(StudentScheduler.AppLogic.User);

                    if (pssday.length === 0) {
                        s = (s || "") + "<i>Na tento den není nic naplánovaného</i>";
                    }

                    for (var i = 0; i < pssday.length; i = (i + 1) | 0) {
                        var current = pssday[System.Array.index(i, pssday)];

                        // Insert break
                        if (possedStudentsToday === StudentScheduler.AppLogic.Plan.breakAfterLessons && this.breakAfterLessonsStart[System.Array.index(day, this.breakAfterLessonsStart)] !== 2147483647) {
                            var breakFrom = Bridge.Int.clip32(Math.floor(this.breakAfterLessonsStart[System.Array.index(day, this.breakAfterLessonsStart)] / 60.0));
                            var breakTo = Bridge.Int.clip32(Math.floor((((this.breakAfterLessonsStart[System.Array.index(day, this.breakAfterLessonsStart)] + StudentScheduler.AppLogic.Plan.breakAfterLessonsLength) | 0)) / 60.0));

                            var BreakHFrom = (System.Int32.format(breakFrom, "00") || "") + ":" + (System.Int32.format((((this.breakAfterLessonsStart[System.Array.index(day, this.breakAfterLessonsStart)] - Bridge.Int.mul(breakFrom, 60)) | 0)), "00") || "");
                            var BreakHTo = (System.Int32.format(breakTo, "00") || "") + ":" + (System.Int32.format((((((this.breakAfterLessonsStart[System.Array.index(day, this.breakAfterLessonsStart)] + StudentScheduler.AppLogic.Plan.breakAfterLessonsLength) | 0) - Bridge.Int.mul(breakTo, 60)) | 0)), "00") || "");

                            s = (s || "") + ((System.String.format("<div class=\"card card-body\" style=\"display: inline;\"><span style=\"font-style: italic;\">Přestávka</span> ({0} - {1})</div>", BreakHFrom, BreakHTo)) || "");

                        }


                        var hoursFrom = Bridge.Int.clip32(Math.floor(current.assignedMinutes / 60.0));
                        var hoursTo = Bridge.Int.clip32(Math.floor((((current.assignedMinutes + StudentScheduler.AppLogic.Plan.lessonLength) | 0)) / 60.0));

                        var hFrom = (System.Int32.format(hoursFrom, "00") || "") + ":" + (System.Int32.format((((current.assignedMinutes - Bridge.Int.mul(hoursFrom, 60)) | 0)), "00") || "");
                        var hTo = (System.Int32.format(hoursTo, "00") || "") + ":" + (System.Int32.format((((((current.assignedMinutes + StudentScheduler.AppLogic.Plan.lessonLength) | 0) - Bridge.Int.mul(hoursTo, 60)) | 0)), "00") || "");

                        s = (s || "") + (((System.String.format("<div class=\"card card-body\">{0} (", [current.name]) || "") + (System.String.format("{0} - {1})</div>", hFrom, hTo) || "")) || "");

                        possedStudentsToday = (possedStudentsToday + 1) | 0;
                    }

                    s = (s || "") + "</div></div>";
                }

                return s;
            },
            Calc: function () {
                var $t, $t1;
                for (var day = 0; day < 5; day = (day + 1) | 0) {
                    $t = Bridge.getEnumerator(this.teachers);
                    try {
                        while ($t.moveNext()) {
                            var teacher = $t.Current;
                            if (((teacher.minutesToAvailable[System.Array.index(day, teacher.minutesToAvailable)] - teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)]) | 0) >= StudentScheduler.AppLogic.Plan.lessonLength) {
                                teacher.daysAvailable[System.Array.index(day, teacher.daysAvailable)] = true;
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }
                    $t1 = Bridge.getEnumerator(this.students);
                    try {
                        while ($t1.moveNext()) {
                            var student = $t1.Current;
                            if (((student.minutesToAvailable[System.Array.index(day, student.minutesToAvailable)] - student.minutesFromAvailable[System.Array.index(day, student.minutesFromAvailable)]) | 0) >= StudentScheduler.AppLogic.Plan.lessonLength) {
                                student.daysAvailable[System.Array.index(day, student.daysAvailable)] = true;
                            }
                        }
                    } finally {
                        if (Bridge.is($t1, System.IDisposable)) {
                            $t1.System$IDisposable$dispose();
                        }
                    }}



                // HOW THIS WORKS:


                // 1.0) Set start time as teacher's start time of the day
                // 1.1) Find student who has starting time the same as teacher's start time. If yes, pos and repeat 1) 45 minutes later.
                //      If not, move by 5 minutes and try it again with all students. If hit teacher's end time, move to next day

                // OPTIMALIZATION: Check if both teacher and students have some minutes in common. If not, skip this day




                // If all students are positioned, end. If not, head to step 2

                // 2.0) I have some students without assigned hours. Pick student with least possible hours. Find all
                //      hours where I can pos this student in all days.
                // 2.1) Choose the position where the least unassigned students can go. After that, choose position where
                //      is student with most free time
                // 2.2) Swap those students
                // 2.3) Repeat. If already repeated N times, where N is number of unassigned students at the beggining of phase 2,
                //      end, show all positioned students and report failure



                if (this.teachers.Count !== 1 || this.students.Count === 0) {
                    return;
                }

                // Reset previous calculations
                for (var i = 0; i < this.students.Count; i = (i + 1) | 0) {
                    this.students.getItem(i).assigned = false;
                    this.students.getItem(i).assignedDay = -1;
                    this.students.getItem(i).assignedMinutes = -1;
                }

                // First stage
                //TryToPosAllStudentsVer2();
                // Second stage
                //PosNotPossedStudents();



                // OR I could do it this way:

                // 1            For all days where at least 1 teacher + 1 student has time and someone is not assigned yet
                // 1.1          Pos 3 students this way: Pos student that can be there the earliest time. If there is someone, that can be there
                //              <50 minutes after the student and has less time, place him instead
                // 1.2          Place a break
                // 1.3          Place as many students as you can

                // 2            For all unassigned students:
                // 2.1          Get all students that are blocking him. Do this for all (ordered by number of time) of them unless the student is possed:
                // 2.1.1        Swap these students. Remember to move other students behind him if neccessary. Be careful if someone loses position because of this
                // 2.1.2        If these swapped students (that don't have time now) don't have [direct] place to stay, revert changes
                // 2.1.3        Else, place students there and go back to [2]


                //PosStudents();
                //IDontCareJustPossStudents(); // THIS WASNT COMMENTED






                // USING FLOWS:

                try {
                    this.DoItUsingFlows();
                }
                catch (ex) {
                    ex = System.Exception.create(ex);
                    StudentScheduler.Log.Write(ex, StudentScheduler.Log.Severity.Critical);
                }
            },
            TryToPosAllStudentsVer2: function () {
                var $t, $t1, $t2;
                var teacher = this.teachers.getItem(0);

                for (var day = 0; day < 5; day = (day + 1) | 0) {
                    if (((teacher.minutesToAvailable[System.Array.index(day, teacher.minutesToAvailable)] - teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)]) | 0) < StudentScheduler.AppLogic.Plan.lessonLength) {
                        continue;
                    }

                    var studentsToday = System.Linq.Enumerable.from(this.students).where(function (x) {
                            return !x.assigned && ((x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] - x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)]) | 0) >= StudentScheduler.AppLogic.Plan.lessonLength;
                        }).orderBy(function (x) {
                        return ((x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] - x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)]) | 0);
                    }).toArray(StudentScheduler.AppLogic.User);

                    var possedHours = 0;
                    var minuteBreak = -1;

                    for (var i = 0; i < studentsToday.length; i = (i + 1) | 0) {
                        // TODO: Muze se stat, ze ten student s nejmin velnyho casu bude mermomoci vepredu a bude blokovat misto pro jinyho, i kdyz by se
                        // v pohode vesel jeste dozadu. Treba A ma min casu nez B. A: 12:30-15:00, B: 12:00-17:00, vysledek bude
                        // A: 12:30-13:20, B: 13:20-14:10 MISTO B :12:00 - 12:50, A: 12:50-13:40

                        for (var minute = { v : ($t = studentsToday[System.Array.index(i, studentsToday)].minutesFromAvailable)[System.Array.index(day, $t)] }; minute.v <= ($t1 = studentsToday[System.Array.index(i, studentsToday)].minutesToAvailable)[System.Array.index(day, $t1)]; minute.v = (minute.v + 5) | 0) {
                            if (teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)] > minute.v) {
                                minute.v = (teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)] - 5) | 0;
                                continue;
                            }

                            if (teacher.minutesToAvailable[System.Array.index(day, teacher.minutesToAvailable)] < minute.v) {
                                break;
                            }

                            // If break
                            if (minute.v >= minuteBreak && minute.v <= ((minuteBreak + StudentScheduler.AppLogic.Plan.breakAfterLessonsLength) | 0)) {
                                continue;
                            }

                            var studentsInThisTimeFrame = System.Linq.Enumerable.from(studentsToday).where((function ($me, minute) {
                                    return function (x) {
                                        return x.assigned && x.assignedDay === day && x.assignedMinutes >= ((minute.v - StudentScheduler.AppLogic.Plan.lessonLength) | 0) && x.assignedMinutes <= ((minute.v + StudentScheduler.AppLogic.Plan.lessonLength) | 0);
                                    };
                                })(this, minute));

                            if (studentsInThisTimeFrame.count() > 0) {
                                continue;
                            }

                            possedHours = (possedHours + 1) | 0;

                            studentsToday[System.Array.index(i, studentsToday)].assigned = true;
                            studentsToday[System.Array.index(i, studentsToday)].assignedDay = day;
                            studentsToday[System.Array.index(i, studentsToday)].assignedMinutes = minute.v;

                            if (possedHours === StudentScheduler.AppLogic.Plan.breakAfterLessons) {
                                possedHours = -2147483648;
                                StudentScheduler.Log.Write(System.Linq.Enumerable.from(studentsToday).where(function (x) {
                                        return x.assigned;
                                    }).orderBy(function (x) {
                                    return x.assignedMinutes;
                                }).select(function (x) {
                                    return x.name;
                                }).toArray(System.String).join(", "), StudentScheduler.Log.Severity.Info);
                                var minuteOfLastPossedStudentToday = (($t2 = System.Linq.Enumerable.from(studentsToday).where(function (x) {
                                        return x.assigned;
                                    }).orderBy(function (x) {
                                    return x.assignedMinutes;
                                }).toArray(StudentScheduler.AppLogic.User))[System.Array.index(2, $t2)].assignedMinutes + StudentScheduler.AppLogic.Plan.lessonLength) | 0;
                                minuteBreak = minuteOfLastPossedStudentToday;
                                this.breakAfterLessonsStart[System.Array.index(day, this.breakAfterLessonsStart)] = minuteBreak;
                            }
                            break;
                        }
                    }
                }
            },
            PosNotPossedStudents: function () {
                var unpossedStudents = System.Linq.Enumerable.from(this.students).where(function (student) {
                        return !student.assigned;
                    }).toList(StudentScheduler.AppLogic.User);

                if (unpossedStudents.Count === 0) {
                    return;
                }

                var change = true;

                while (change) {
                    change = false;
                    // Pick one of unposed students with lowest number of possible hours
                    var lowestStudentIndex = -1;
                    var lowestStudentMinutes = 2147483647;
                    for (var i = 0; i < unpossedStudents.Count; i = (i + 1) | 0) {
                        var s = unpossedStudents.getItem(i);
                        var minutes = 0;
                        for (var day = 0; day < 5; day = (day + 1) | 0) {
                            minutes = (minutes + (((s.minutesToAvailable[System.Array.index(day, s.minutesToAvailable)] - s.minutesFromAvailable[System.Array.index(day, s.minutesFromAvailable)]) | 0))) | 0;
                        }
                        if (minutes < lowestStudentMinutes) {
                            lowestStudentIndex = i;
                            lowestStudentMinutes = minutes;
                        }
                    }
                    var selectStudent = unpossedStudents.getItem(lowestStudentIndex);


                }
            },
            TryToPosAllStudents: function () {
                // Assuming I have just one teacher
                var teacher = this.teachers.getItem(0);

                for (var day = 0; day < 5; day = (day + 1) | 0) {
                    // For all days, skip day if either all students or teacher are busy

                    // Get all students that have at least 50mins time today and still don't have anything assigned
                    var studentsForThisDay = System.Linq.Enumerable.from(this.students).where(function (x) {
                            return ((x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] - x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)]) | 0) >= StudentScheduler.AppLogic.Plan.lessonLength && !x.assigned;
                        }).toArray(StudentScheduler.AppLogic.User);

                    if (((teacher.minutesToAvailable[System.Array.index(day, teacher.minutesToAvailable)] - teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)]) | 0) < StudentScheduler.AppLogic.Plan.lessonLength || studentsForThisDay.length === 0) {
                        continue;
                    }



                    // Go for all the teacher's minutes today

                    var hoursElapsed = 0;
                    for (var minute = { v : teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)] }; minute.v <= teacher.minutesToAvailable[System.Array.index(day, teacher.minutesToAvailable)]; minute.v = (minute.v + 5) | 0) {
                        if (hoursElapsed === StudentScheduler.AppLogic.Plan.breakAfterLessons) {
                            hoursElapsed = -2147483648;

                            minute.v = (minute.v + StudentScheduler.AppLogic.Plan.breakAfterLessonsLength) | 0;
                            continue;
                        }

                        var studentsInThisTerm = System.Linq.Enumerable.from(studentsForThisDay).where((function ($me, minute) {
                                return function (student) {
                                    return student.minutesFromAvailable[System.Array.index(day, student.minutesFromAvailable)] <= minute.v && student.minutesToAvailable[System.Array.index(day, student.minutesToAvailable)] >= ((minute.v + StudentScheduler.AppLogic.Plan.lessonLength) | 0);
                                };
                            })(this, minute)).orderBy(function (x) {
                            return ((x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] - x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)]) | 0);
                        }).toArray(StudentScheduler.AppLogic.User);

                        var chosenStudent = System.Linq.Enumerable.from(studentsInThisTerm).firstOrDefault(null, null);

                        if (chosenStudent == null) {
                            continue;
                        }

                        chosenStudent.assignedMinutes = minute.v;
                        chosenStudent.assignedDay = day;
                        chosenStudent.assigned = true;

                        minute.v = (minute.v + (45)) | 0;

                        hoursElapsed = (hoursElapsed + 1) | 0;
                    }
                }
            },
            PosStudents: function () {
                for (var day = 0; day < 5; day = (day + 1) | 0) {
                    // Assuming I have just one teacher
                    var teacher = this.teachers.getItem(0);

                    // Get all students that have at least 50mins time today and still don't have anything assigned
                    var studentsForThisDay = System.Linq.Enumerable.from(this.students).where(function (x) {
                            return ((x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] - x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)]) | 0) >= StudentScheduler.AppLogic.Plan.lessonLength && !x.assigned;
                        }).orderBy(function (x) {
                        return ((x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] - x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)]) | 0);
                    }).toArray(StudentScheduler.AppLogic.User);

                    if (((teacher.minutesToAvailable[System.Array.index(day, teacher.minutesToAvailable)] - teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)]) | 0) < StudentScheduler.AppLogic.Plan.lessonLength || !teacher.daysAvailable[System.Array.index(day, teacher.daysAvailable)] || studentsForThisDay.length === 0) {
                        return;
                    }

                    var possed = 0;
                    // Go thru all teacher hours
                    for (var time = { v : teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)] }; time.v <= ((teacher.minutesToAvailable[System.Array.index(day, teacher.minutesToAvailable)] - StudentScheduler.AppLogic.Plan.lessonLength) | 0); time.v = (time.v + 5) | 0) {
                        // Lets take a break
                        if (possed === 3) {
                            this.breakAfterLessonsStart[System.Array.index(day, this.breakAfterLessonsStart)] = time.v;
                            time.v = (time.v + (10)) | 0;
                            possed = (possed + 1) | 0;
                        }

                        // If there is student available
                        var studentsAvailable = System.Linq.Enumerable.from(studentsForThisDay).where((function ($me, time) {
                                return function (x) {
                                    return x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)] <= time.v && x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] >= ((time.v + StudentScheduler.AppLogic.Plan.lessonLength) | 0);
                                };
                            })(this, time)).orderBy(function (x) {
                            return x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)];
                        }); // TODO: Kdyz jsou dva se stejnyma hodinama, uprednostnit toho, kdo ma min casu
                        StudentScheduler.Log.Write(Bridge.toArray(studentsAvailable.select(function (x) {
                                return (x.name || "") + ": " + x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)];
                            })).join(", "), StudentScheduler.Log.Severity.Info);

                        var chosenStudent = studentsAvailable.firstOrDefault(null, null);

                        if (chosenStudent == null) {
                            continue;
                        }

                        chosenStudent.assignedMinutes = time.v;
                        chosenStudent.assignedDay = day;
                        chosenStudent.assigned = true;

                        time.v = (time.v + (45)) | 0;

                        possed = (possed + 1) | 0;
                    }
                }
            },
            BruteForceStudents$1: function () {
                var teacher = this.teachers.getItem(0);

                for (var day = 0; day < 5; day = (day + 1) | 0) {
                    if (teacher.daysAvailable[System.Array.index(day, teacher.daysAvailable)]) {
                        var result = this.BruteForceStudents(day, teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)], teacher.minutesToAvailable[System.Array.index(day, teacher.minutesToAvailable)], 0);
                        for (var i = 0; i < result.Count; i = (i + 1) | 0) {
                            result.getItem(i).$clone().student.assigned = true;
                            result.getItem(i).$clone().student.assignedDay = day;
                            result.getItem(i).$clone().student.assignedMinutes = result.getItem(i).$clone().minutesFrom;
                        }
                    }
                }
            },
            BruteForceStudents: function (day, startTime, endTime, studentsPossed) {
                var $t;
                if (startTime >= ((endTime - StudentScheduler.AppLogic.Plan.lessonLength) | 0)) {
                    return new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.BruteForcedStudent)).ctor();
                }

                var startStudent = System.Linq.Enumerable.from(this.students).where(function (x) {
                        return !x.assigned && x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)] >= startTime && x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] <= endTime;
                    }).orderBy(function (x) {
                    return x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)];
                }).firstOrDefault(null, null);
                if (startStudent == null) {
                    startTime = (startTime + 5) | 0;
                    return this.BruteForceStudents(day, startTime, endTime, studentsPossed);
                }

                var startStudentStartTime = startStudent.minutesFromAvailable[System.Array.index(day, startStudent.minutesFromAvailable)];


                studentsPossed = (studentsPossed + 1) | 0;
                startTime = (startTime + StudentScheduler.AppLogic.Plan.lessonLength) | 0;
                if (studentsPossed === StudentScheduler.AppLogic.Plan.breakAfterLessons) {
                    startTime = (startTime + StudentScheduler.AppLogic.Plan.breakAfterLessonsLength) | 0;
                }
                var anotherStudents = System.Linq.Enumerable.from(this.students).where(function (x) {
                        return !x.assigned && x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)] > ((startStudentStartTime - StudentScheduler.AppLogic.Plan.lessonLength) | 0) && x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] <= endTime && !Bridge.referenceEquals(x, startStudent);
                    });

                StudentScheduler.Log.Write("----------------------", StudentScheduler.Log.Severity.Info);
                StudentScheduler.Log.Write((startStudent.name || "") + ",", StudentScheduler.Log.Severity.Info);
                StudentScheduler.Log.Write(Bridge.toArray(anotherStudents.select(function (x) {
                        return x.name;
                    })).join(","), StudentScheduler.Log.Severity.Info);

                var preResult = new (System.Collections.Generic.List$1(System.Collections.Generic.List$1(StudentScheduler.AppLogic.BruteForcedStudent))).ctor();

                {
                    var possResult = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.BruteForcedStudent)).ctor();
                    possResult.add(new StudentScheduler.AppLogic.BruteForcedStudent.$ctor1(startStudentStartTime, startStudent));
                    var newStudents = this.BruteForceStudents(day, startTime, endTime, studentsPossed);
                    if (newStudents != null) {
                        possResult.addRange(newStudents);
                    }
                    preResult.add(possResult);
                }
                $t = Bridge.getEnumerator(anotherStudents);
                try {
                    while ($t.moveNext()) {
                        var anotherStudent = $t.Current;
                        var possibleResult = new (System.Collections.Generic.List$1(StudentScheduler.AppLogic.BruteForcedStudent)).ctor();
                        possibleResult.add(new StudentScheduler.AppLogic.BruteForcedStudent.$ctor1(Math.max(startTime, anotherStudent.minutesFromAvailable[System.Array.index(day, anotherStudent.minutesFromAvailable)]), anotherStudent));
                        var newStudents1 = this.BruteForceStudents(day, startTime, endTime, studentsPossed);
                        if (newStudents1 != null) {
                            possibleResult.addRange(newStudents1);
                        }
                        preResult.add(possibleResult);
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }System.Linq.Enumerable.from(preResult).orderByDescending(function (x) {
                        return x.Count;
                    });

                return System.Linq.Enumerable.from(preResult).first();
            },
            IDontCareJustPossStudents: function () {
                var teacher = this.teachers.getItem(0);

                for (var day = 0; day < 5; day = (day + 1) | 0) {
                    if (teacher.daysAvailable[System.Array.index(day, teacher.daysAvailable)]) {
                        var startTime = { v : teacher.minutesFromAvailable[System.Array.index(day, teacher.minutesFromAvailable)] };
                        var endTime = teacher.minutesToAvailable[System.Array.index(day, teacher.minutesToAvailable)];
                        var studentsPossed = 0;

                        for (var minute = { v : 0 }; minute.v < ((endTime - startTime.v) | 0); ) {
                            var studentsRightNow = System.Linq.Enumerable.from(this.students).where((function ($me, startTime, minute) {
                                    return function (x) {
                                        return !x.assigned && x.daysAvailable[System.Array.index(day, x.daysAvailable)] && x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)] <= ((startTime.v + minute.v) | 0) && x.minutesToAvailable[System.Array.index(day, x.minutesToAvailable)] >= ((((startTime.v + minute.v) | 0) + StudentScheduler.AppLogic.Plan.lessonLength) | 0);
                                    };
                                })(this, startTime, minute));

                            if (studentsRightNow.count() === 0) {
                                minute.v = (minute.v + 1) | 0;
                                continue;
                            }

                            var studentToPos = studentsRightNow.first(); // TODO: Choose someone better way
                            studentToPos.assigned = true;
                            studentToPos.assignedDay = day;
                            studentToPos.assignedMinutes = (startTime.v + minute.v) | 0;

                            studentsPossed = (studentsPossed + 1) | 0;

                            minute.v = (minute.v + StudentScheduler.AppLogic.Plan.lessonLength) | 0;

                            if (studentsPossed === StudentScheduler.AppLogic.Plan.breakAfterLessons) {
                                this.breakAfterLessonsStart[System.Array.index(day, this.breakAfterLessonsStart)] = (startTime.v + minute.v) | 0;
                                minute.v = (minute.v + StudentScheduler.AppLogic.Plan.breakAfterLessonsLength) | 0;
                                studentsPossed = (studentsPossed + 1) | 0;
                            }
                        }
                    }
                }
            },
            DoItUsingFlows: function () {
                var flow = new StudentScheduler.AppLogic.NetworkFlow.Flow(this.teachers.getItem(0), this.students);
                // Alter flow

                /* flow.DEBUG_ClearNodes();
                Node root = new Node("Input", -1, Node.NodeType.Input);
                Node sink = new Node("Output", -1, Node.NodeType.Output);
                // Create students 1 and 2
                Node s1 = new Node("Student 1", -1, Node.NodeType.Default);
                Node s2 = new Node("Student 2", -1, Node.NodeType.Default);
                // Create times (not overlapping)
                Node t1 = new Node("Time (100)", 100, Node.NodeType.Default);
                Node t2 = new Node("Time (700)", 700, Node.NodeType.Default);
                // Add time chunk
                Node tch = new Node("Time Chunk Node", -1, Node.NodeType.Default);
                // Add paths from root to students and from times to timechunk and from timechunk via [timechunk] to sink
                root.OutputEdges.Add(new Edge(1, 0, root, s1));
                root.OutputEdges.Add(new Edge(1, 0, root, s2));
                s1.InputEdges.Add(root.OutputEdges[0]);
                s2.InputEdges.Add(root.OutputEdges[1]);

                t1.OutputEdges.Add(new Edge(1, 0, t1, tch));
                t2.OutputEdges.Add(new Edge(1, 0, t2, tch));
                tch.InputEdges.Add(t1.OutputEdges[0]);
                tch.InputEdges.Add(t1.OutputEdges[0]);

                tch.OutputEdges.Add(new TimeChunk(tch, sink));
                sink.InputEdges.Add(tch.OutputEdges[0]);
                // Add paths from students to times
                s1.OutputEdges.Add(new Edge(1, 0, s1, t1));
                s1.OutputEdges.Add(new Edge(1, 0, s1, t2));

                // Apply new graph
                flow.Nodes.AddRange(new List<Node>() { root, s1, s2, t1, t2, tch, sink });*/
                // End of alter flow
                var breaks = flow.GetResult();
                this.breakAfterLessonsStart = breaks;
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.User", {
        fields: {
            name: null,
            daysAvailable: null,
            minutesFromAvailable: null,
            minutesToAvailable: null,
            assignedMinutes: 0,
            assignedDay: 0,
            assigned: false
        },
        ctors: {
            init: function () {
                this.assignedMinutes = -1;
                this.assignedDay = -1;
                this.assigned = false;
            },
            ctor: function (name, daysAvailable, minutesFromAvailable, minutesToAvailable) {
                this.$initialize();
                this.name = name;
                this.daysAvailable = daysAvailable;
                this.minutesFromAvailable = minutesFromAvailable;
                this.minutesToAvailable = minutesToAvailable;
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

                return System.String.format("Od {0}:{1} do {2}:{3}", Bridge.box(hoursF, System.Int32), System.Int32.format((((minutesF - Bridge.Int.mul(hoursF, 60)) | 0)), "00"), Bridge.box(hoursT, System.Int32), System.Int32.format((((minutesT - Bridge.Int.mul(hoursT, 60)) | 0)), "00"));
            }
        }
    });

    Bridge.define("StudentScheduler.Log", {
        statics: {
            fields: {
                lengthCollapseStart: 0,
                previewLength: 0,
                target: null,
                counter: 0
            },
            ctors: {
                init: function () {
                    this.lengthCollapseStart = 2147483647;
                    this.previewLength = 30;
                    this.counter = 0;
                }
            },
            methods: {
                InitializeWithDiv: function (targetDiv) {
                    StudentScheduler.Log.target = targetDiv;
                },
                Write: function (o, severity) {
                    // Log object to javascript console
                    console.log(Bridge.unbox(o));
                    // Log object with severity to the div
                    var text = o.toString();

                    var html = "";
                    // If the text is very long, collapse it
                    if (text.length > StudentScheduler.Log.lengthCollapseStart) {

                        var preview = (text.substr(0, StudentScheduler.Log.previewLength) || "") + "...";
                        html = "<button type='button' class='logExpandable' data-toggle='collapse' data-target='#collapse-log-" + StudentScheduler.Log.counter + "'>" + "<p style='color: " + (StudentScheduler.Log.GetColorBasedOnSeverity(severity) || "") + ";'>" + (preview || "") + "</p></div>";
                        html = (html || "") + (("<div class='collapse row' id='collapse-log-" + StudentScheduler.Log.counter + "'><div class='card card-body'>" + (text || "") + "</div></div>") || "");
                        StudentScheduler.Log.counter = (StudentScheduler.Log.counter + 1) | 0;
                    } else {
                        html = "<p style='color: " + (StudentScheduler.Log.GetColorBasedOnSeverity(severity) || "") + ";'>" + (text || "") + "<p>";
                    }

                    StudentScheduler.Log.WriteToDebug(html);
                },
                WriteToDebug: function (html) {
                    StudentScheduler.Log.target.innerHTML = (StudentScheduler.Log.target.innerHTML || "") + (((html || "") + "<hr />") || "");
                },
                GetColorBasedOnSeverity: function (severity) {
                    switch (severity) {
                        case StudentScheduler.Log.Severity.Info: 
                            return "Black";
                        case StudentScheduler.Log.Severity.Warning: 
                            return "Green";
                        case StudentScheduler.Log.Severity.Critical: 
                            return "Red";
                    }

                    return "Black";
                }
            }
        }
    });

    Bridge.define("StudentScheduler.Log.Severity", {
        $kind: "enum",
        statics: {
            fields: {
                Info: 0,
                Warning: 1,
                Critical: 2
            }
        }
    });

    Bridge.define("StudentScheduler.AppLogic.NetworkFlow.TimeChunk", {
        inherits: [StudentScheduler.AppLogic.NetworkFlow.Edge],
        ctors: {
            ctor: function (from, to) {
                this.$initialize();
                StudentScheduler.AppLogic.NetworkFlow.Edge.ctor.call(this, 0, 0, from, to);
            }
        },
        methods: {
            GetBlockingNodes: function (timeNodes, baseNode) {
                var blockingNodes = System.Linq.Enumerable.from(timeNodes).where(function (tNode) {
                        return Math.abs(((tNode.Value - baseNode.Value) | 0)) < 50;
                    }).count();

                if (blockingNodes === 0) {
                    StudentScheduler.Log.Write("I just passed with this settings: " + (Bridge.toArray(System.Linq.Enumerable.from(timeNodes).select(function (node) {
                                return (node.Identifier || "") + " with value " + node.Value;
                            })).join(" , ") || "") + ". Base was " + (baseNode.Identifier || "") + " with value " + baseNode.Value, StudentScheduler.Log.Severity.Critical);
                } else {
                    StudentScheduler.Log.Write("I didn't pass with this settings:" + (Bridge.toArray(System.Linq.Enumerable.from(timeNodes).select(function (node) {
                                return (node.Identifier || "") + " with value " + node.Value;
                            })).join(" , ") || "") + ". Base was " + (baseNode.Identifier || "") + " with value " + baseNode.Value, StudentScheduler.Log.Severity.Critical);
                }

                return blockingNodes;
            },
            /**
             * @instance
             * @public
             * @override
             * @this StudentScheduler.AppLogic.NetworkFlow.TimeChunk
             * @memberof StudentScheduler.AppLogic.NetworkFlow.TimeChunk
             * @param   {System.Collections.Generic.IEnumerable$1}      currentPath    
             * @param   {StudentScheduler.AppLogic.NetworkFlow.Flow}    flow           
             * @param   {string}                                        info
             * @return  {number}                                                       Number of nodes that block current path
             */
            GetCurrentFlow: function (currentPath, flow, info) {
                if (Bridge.referenceEquals(info, "ThisToString")) {
                    return -2147483648;
                }

                var blockingNodes = -1;
                try {
                    var baseNode = System.Linq.Enumerable.from(currentPath).toList(Bridge.global.StudentScheduler.AppLogic.NetworkFlow.Node).getItem(((System.Linq.Enumerable.from(currentPath).count() - 2) | 0));
                    StudentScheduler.Log.Write("GetCurrentFlow Path: " + (Bridge.toArray(System.Linq.Enumerable.from(currentPath).select(function (node) {
                                return node.Value;
                            })).join(",") || ""), StudentScheduler.Log.Severity.Info);
                    var allTimeNodes = System.Linq.Enumerable.from(flow.Nodes).where(function (node) {
                            return node.Value !== -1 && !Bridge.referenceEquals(node, baseNode) && System.Linq.Enumerable.from(node.InputEdges).where(function (edge) {
                                    return edge.GetCurrentFlow(null, null, "GetCurrentFlow") === 1;
                                }).count() === 1;
                        }).toList(StudentScheduler.AppLogic.NetworkFlow.Node);
                    System.Linq.Enumerable.from(allTimeNodes).union(System.Linq.Enumerable.from(currentPath).where(function (node) {
                                return node.Value !== -1 && !Bridge.referenceEquals(node, baseNode);
                            }));
                    StudentScheduler.Log.Write("Starting BlockingNodes...", StudentScheduler.Log.Severity.Info);
                    blockingNodes = this.GetBlockingNodes(allTimeNodes, baseNode);
                    StudentScheduler.Log.Write("Ending BlockingNodes...", StudentScheduler.Log.Severity.Info);
                }
                catch (ex) {
                    ex = System.Exception.create(ex);
                    StudentScheduler.Log.Write("BlockingNodes Failed! Info: " + (info || ""), StudentScheduler.Log.Severity.Critical);
                    StudentScheduler.Log.Write(ex, StudentScheduler.Log.Severity.Critical);
                    throw ex;
                }
                return blockingNodes;
            },
            SetCurrentFlow: function (newValue) {
                // Do nothing
            }
        }
    });
});

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJTdHVkZW50U2NoZWR1bGVyLmpzIiwKICAic291cmNlUm9vdCI6ICIiLAogICJzb3VyY2VzIjogWyJBcHBMb2dpYy9BcHAuY3MiLCJBcHBMb2dpYy9QbGFuLmNzIiwiQXBwTG9naWMvTmV0d29ya0Zsb3cvRWRnZS5jcyIsIkFwcExvZ2ljL05ldHdvcmtGbG93L0Zsb3cuY3MiLCJBcHBMb2dpYy9OZXR3b3JrRmxvdy9Ob2RlLmNzIiwiQXBwTG9naWMvVXNlci5jcyIsIkxvZy5jcyIsIkFwcExvZ2ljL05ldHdvcmtGbG93L1RpbWVDaHVuay5jcyJdLAogICJuYW1lcyI6IFsiIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7WUF1QllBLDRCQUFPQSxJQUFJQTs7O1lBR1hBLG9CQUFvQkE7WUFDcEJBLGlFQUF5QkEsVUFBQ0E7Z0JBQVFBLG1DQUFjQTs7WUFDaERBLG9CQUFvQkE7WUFDcEJBLGlFQUF5QkEsVUFBQ0E7Z0JBQVFBLG1DQUFjQTs7O1lBRWhEQSxXQUFXQTtZQUNYQSxLQUFLQSxXQUFXQSxJQUFJQSxhQUFhQTtnQkFDN0JBLEtBQUtBLCtCQUFMQSxLQUFLQSxZQUFjQSxVQUFDQTtvQkFBUUEsb0NBQWVBLEtBQUtBOzs7O1lBRXBEQSxPQUFPQTtZQUNQQSxLQUFLQSxZQUFXQSxLQUFJQSxhQUFhQTtnQkFDN0JBLEtBQUtBLGdDQUFMQSxLQUFLQSxhQUFjQSxVQUFDQTtvQkFBUUEsb0NBQWVBLEtBQUtBOzs7O1lBRXBEQSxPQUFPQTtZQUNQQSxLQUFLQSxZQUFXQSxLQUFJQSxhQUFhQTtnQkFFN0JBLGNBQVFBO2dCQUNSQSxLQUFLQSxnQ0FBTEEsS0FBS0EsYUFBY0E7cUNBQUNBO3dCQUFRQSwyQ0FBc0JBLEtBQUtBOzs7O1lBRTNEQSxxREFBZ0NBLFVBQUNBO2dCQUFRQTtnQkFBa0JBOzs7WUFFM0RBLDREQUF1Q0EsVUFBQ0E7Z0JBQVFBO2dCQUFtQkE7OztZQUVuRUEsMENBQXFCQSxVQUFDQTtnQkFBUUE7Z0JBQWFBLCtDQUEwQkE7Ozs7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QSxBQUFnRkE7dUNBQVFBLGVBQWNBLE1BQU1BLDhCQUFRQTs7b0JBQy9TQSx3REFBdUNBO29CQUN2Q0EsZ0JBQWdCQSxzQkFBaUJBLGNBQWNBO29CQUMvQ0Esc0RBQXFDQTs7OztvQkFJckNBLDJCQUFVQSxrQ0FBaUNBLGFBQU1BO29CQUNqREEsMkJBQVVBLElBQUlBO29CQUNkQSxNQUFNQTs7Z0JBRVZBLE9BQU9BOztzQ0FHeUJBIiwKICAic291cmNlc0NvbnRlbnQiOiBbInVzaW5nIEJyaWRnZTtcclxudXNpbmcgQnJpZGdlLkh0bWw1O1xyXG51c2luZyBOZXd0b25zb2Z0Lkpzb247XHJcbnVzaW5nIFN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWM7XHJcbnVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG5cclxubmFtZXNwYWNlIFN0dWRlbnRTY2hlZHVsZXJcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEFwcFxyXG4gICAge1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIFBsYW4gcGxhbjtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBib29sIGxhc3RTZXRXYXNUZWFjaGVyO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGludCBsYXN0U2V0SWQ7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW50IGxhc3RTZWxlY3RlZERheTtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpbnQgZGF5SWQ7XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHN0cmluZ1tdIGRheXMgPSB7IFwibW9uZGF5XCIsIFwidHVlc2RheVwiLCBcIndlZG5lc2RheVwiLCBcInRodXJzZGF5XCIsIFwiZnJpZGF5XCIgfTtcclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkIE1haW4oKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogbG9hZD9cclxuICAgICAgICAgICAgcGxhbiA9IG5ldyBQbGFuKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZWdpc3RlciBjYWxsYmFja3NcclxuICAgICAgICAgICAgdmFyIGJ1dE5ld1RlYWNoZXIgPSBHaWQoXCJhZGQtdGVhY2hlclwiKTtcclxuICAgICAgICAgICAgYnV0TmV3VGVhY2hlci5PbkNsaWNrICs9IChlKSA9PiB7IEFkZE5ld1RlYWNoZXIoYnV0TmV3VGVhY2hlcik7IH07XHJcbiAgICAgICAgICAgIHZhciBidXROZXdTdHVkZW50ID0gR2lkKFwiYWRkLXN0dWRlbnRcIik7XHJcbiAgICAgICAgICAgIGJ1dE5ld1N0dWRlbnQuT25DbGljayArPSAoZSkgPT4geyBBZGROZXdTdHVkZW50KGJ1dE5ld1N0dWRlbnQpOyB9O1xyXG5cclxuICAgICAgICAgICAgdmFyIGJ1dHMgPSBHY2woXCJ0ZWFjaGVyLWNsaWNrXCIpO1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGJ1dHMuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgICAgICBidXRzW2ldLk9uQ2xpY2sgKz0gKGUpID0+IHsgRWRpdEhvdXJzQ2xpY2soYnV0c1tpXSwgdHJ1ZSk7IH07XHJcblxyXG4gICAgICAgICAgICBidXRzID0gR2NsKFwic3R1ZGVudC1jbGlja1wiKTtcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBidXRzLkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICAgICAgYnV0c1tpXS5PbkNsaWNrICs9IChlKSA9PiB7IEVkaXRIb3Vyc0NsaWNrKGJ1dHNbaV0sIGZhbHNlKTsgfTtcclxuXHJcbiAgICAgICAgICAgIGJ1dHMgPSBHY2woXCJidXQtdGltZS1zZXRcIik7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgYnV0cy5MZW5ndGg7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IGMgPSBpO1xyXG4gICAgICAgICAgICAgICAgYnV0c1tpXS5PbkNsaWNrICs9IChlKSA9PiB7IFNvbWVEYXlFZGl0SG91cnNDbGljayhidXRzW2NdKTsgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS1ob3Vyc1wiKS5PbkNsaWNrID0gKGUpID0+IHsgU2F2ZUhvdXJDaGFuZ2UoKTsgVXBkYXRlTGlzdE9mRGF5cygpOyB9O1xyXG5cclxuICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtaG91cnMtY2FuY2VsXCIpLk9uQ2xpY2sgPSAoZSkgPT4geyBSZW1vdmVIb3VySW5EYXkoKTsgVXBkYXRlTGlzdE9mRGF5cygpOyB9O1xyXG5cclxuICAgICAgICAgICAgR2lkKFwicnVuXCIpLk9uQ2xpY2sgPSAoZSkgPT4geyBwbGFuLkNhbGMoKTsgR2lkKFwib3V0cHV0XCIpLklubmVySFRNTCA9IHBsYW4uR2VuZXJhdGVIVE1MKCk7IH07XHJcblxyXG4gICAgICAgICAgICAvLyBUZXN0XHJcbiAgICAgICAgICAgIEdpZChcInRlc3RcIikuT25DbGljayA9IChlKSA9PlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvKnBsYW4udGVhY2hlcnMuQWRkKG5ldyBVc2VyKFwiVGVzdCBUZWFjaGVyXCIsIG5ldyBib29sW10geyB0cnVlLCBmYWxzZSwgdHJ1ZSwgZmFsc2UsIGZhbHNlIH0sIG5ldyBpbnRbXSB7IDEyICogNjAsIDAsIDE0ICogNjAsIDAsIDAgfSwgbmV3IGludFtdIHsgMjAgKiA2MCwgMCwgMTkgKiA2MCwgMCwgMCB9KSk7XHJcblxyXG4gICAgICAgICAgICAgICAgcGxhbi5zdHVkZW50cy5BZGQobmV3IFVzZXIoXCJTdHVkZW50IDFcIiwgbmV3IGJvb2xbXSB7IHRydWUsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlIH0sIG5ldyBpbnRbXSB7IDE1ICogNjAsIDAsIDAsIDAsIDAgfSwgbmV3IGludFtdIHsgMTYgKiA2MCwgMCwgMCwgMCwgMCB9KSk7XHJcbiAgICAgICAgICAgICAgICBwbGFuLnN0dWRlbnRzLkFkZChuZXcgVXNlcihcIlN0dWRlbnQgMlwiLCBuZXcgYm9vbFtdIHsgdHJ1ZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UgfSwgbmV3IGludFtdIHsgMTEgKiA2MCwgMCwgMCwgMCwgMCB9LCBuZXcgaW50W10gezE4ICogNjAsIDAsIDAsIDAsIDAgfSkpO1xyXG4gICAgICAgICAgICAgICAgcGxhbi5zdHVkZW50cy5BZGQobmV3IFVzZXIoXCJTdHVkZW50IDNcIiwgbmV3IGJvb2xbXSB7IHRydWUsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlIH0sIG5ldyBpbnRbXSB7IDEyICogNjAsIDAsIDAsIDAsIDAgfSwgbmV3IGludFtdIHsgMTQgKiA2MCwgMCwgMCwgMCwgMCB9KSk7XHJcbiAgICAgICAgICAgICAgICBwbGFuLnN0dWRlbnRzLkFkZChuZXcgVXNlcihcIlN0dWRlbnQgNFwiLCBuZXcgYm9vbFtdIHsgdHJ1ZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UgfSwgbmV3IGludFtdIHsgMCwgMCwgMCwgMCwgMCB9LCBuZXcgaW50W10geyAyMyAqIDYwICsgNTksIDAsIDAsIDAsIDAgfSkpO1xyXG4gICAgICAgICAgICAgICAgKi9cclxuICAgIFxyXG4gICAgICAgICAgICAgICAgLypwbGFuLnRlYWNoZXJzLkFkZChuZXcgVXNlcihcIlRlc3QgVGVhY2hlclwiLCBuZXcgYm9vbFtdIHsgdHJ1ZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UgfSwgbmV3IGludFtdIHsgMTAgKiA2MCwgMCwgMCwgMCwgMCB9LCBuZXcgaW50W10geyAxMiAqIDYwLCAwLCAwLCAwLCAwIH0pKTtcclxuXHJcbiAgICAgICAgICAgICAgICBwbGFuLnN0dWRlbnRzLkFkZChuZXcgVXNlcihcIlN0dWRlbnQgMlwiLCBuZXcgYm9vbFtdIHsgdHJ1ZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UgfSwgbmV3IGludFtdIHsgMTAgKiA2MCwgMCwgMCwgMCwgMCB9LCBuZXcgaW50W10geyAxMiAqIDYwLCAwLCAwLCAwLCAwIH0pKTtcclxuICAgICAgICAgICAgICAgIHBsYW4uc3R1ZGVudHMuQWRkKG5ldyBVc2VyKFwiU3R1ZGVudCAxXCIsIG5ldyBib29sW10geyB0cnVlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSB9LCBuZXcgaW50W10geyAxMCAqIDYwICsgMTAsIDAsIDAsIDAsIDAgfSwgbmV3IGludFtdIHsgMTEgKiA2MCArIDUwLCAwLCAwLCAwLCAwIH0pKTtcclxuICAgICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgICAgICBwbGFuLkNhbGMoKTtcclxuICAgICAgICAgICAgICAgIEdpZChcIm91dHB1dFwiKS5Jbm5lckhUTUwgPSBwbGFuLkdlbmVyYXRlSFRNTCgpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgTG9nLkluaXRpYWxpemVXaXRoRGl2KEdpZChcImxvZ0RpdlwiKSBhcyBIVE1MRGl2RWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIEFkZE5ld1RlYWNoZXIoSFRNTEVsZW1lbnQgc2VuZGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gR2V0IG5hbWUgaW5wdXQgYW5kIGl0J3MgdmFsdWVcclxuICAgICAgICAgICAgSFRNTElucHV0RWxlbWVudCBpbnB1dCA9IChTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50PihzZW5kZXIuUGFyZW50RWxlbWVudC5QYXJlbnRFbGVtZW50LkdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJmb3JtLWdyb3VwXCIpWzBdLkNoaWxkcmVuLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50LCBib29sPikoeCA9PiB4LklkID09IChcInRlYWNoZXItbmFtZVwiKSkpLkZpcnN0KCkgYXMgSFRNTElucHV0RWxlbWVudCk7XHJcbiAgICAgICAgICAgIHN0cmluZyBuZXdUZWFjaGVyTmFtZSA9IGlucHV0LlZhbHVlO1xyXG4gICAgICAgICAgICBpZiAobmV3VGVhY2hlck5hbWUgPT0gXCJcIilcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHBsYW4udGVhY2hlcnMuQWRkKG5ldyBVc2VyKG5ld1RlYWNoZXJOYW1lLCBuZXcgYm9vbFs1XSwgbmV3IGludFs1XSwgbmV3IGludFs1XSkpO1xyXG4gICAgICAgICAgICBIVE1MRWxlbWVudCBkaXYgPSBHaWQoXCJ0ZWFjaGVyc1wiKTtcclxuXHJcbiAgICAgICAgICAgIEhUTUxEaXZFbGVtZW50IGNhcmQgPSBuZXcgSFRNTERpdkVsZW1lbnQoKTtcclxuICAgICAgICAgICAgY2FyZC5DbGFzc05hbWUgPSBcImNhcmQgY2FyZC1ib2R5XCI7XHJcbiAgICAgICAgICAgIGNhcmQuSW5uZXJIVE1MICs9IFwiPHA+PHN0cm9uZz5cIiArIG5ld1RlYWNoZXJOYW1lICsgXCI8L3N0cm9uZz48L3A+XCI7XHJcbiAgICAgICAgICAgIEhUTUxCdXR0b25FbGVtZW50IHNldEhvdXJzID0gbmV3IEhUTUxCdXR0b25FbGVtZW50KCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLk5hbWUgPSAocGxhbi50ZWFjaGVycy5Db3VudCAtIDEpLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLkNsYXNzTmFtZSA9IFwiYnRuIGJ0bi1wcmltYXJ5IHRlYWNoZXItY2xpY2tcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10b2dnbGVcIiwgXCJtb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10YXJnZXRcIiwgXCIjc2V0SG91cnNNb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuSW5uZXJIVE1MID0gXCJOYXN0YXZpdCBob2RpbnlcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuT25DbGljayArPSAoZSkgPT4geyBFZGl0SG91cnNDbGljayhzZXRIb3VycywgdHJ1ZSk7IH07XHJcbiAgICAgICAgICAgIGNhcmQuQXBwZW5kQ2hpbGQoc2V0SG91cnMpO1xyXG4gICAgICAgICAgICBkaXYuQXBwZW5kQ2hpbGQoY2FyZCk7XHJcblxyXG4gICAgICAgICAgICBpbnB1dC5WYWx1ZSA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICAvLyBBbGxvdyBvbmx5IG9uZSB0ZWFjaGVyXHJcbiAgICAgICAgICAgIEdpZChcImFkZC1uZXctdGVhY2hlci1tb2RhbC1idXR0b25cIikuUmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIEFkZE5ld1N0dWRlbnQoSFRNTEVsZW1lbnQgc2VuZGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gR2V0IG5hbWUgaW5wdXQgYW5kIGl0J3MgdmFsdWVcclxuICAgICAgICAgICAgSFRNTElucHV0RWxlbWVudCBpbnB1dCA9IChTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50PihzZW5kZXIuUGFyZW50RWxlbWVudC5QYXJlbnRFbGVtZW50LkdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJmb3JtLWdyb3VwXCIpWzBdLkNoaWxkcmVuLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50LCBib29sPikoeCA9PiB4LklkID09IChcInN0dWRlbnQtbmFtZVwiKSkpLkZpcnN0KCkgYXMgSFRNTElucHV0RWxlbWVudCk7XHJcbiAgICAgICAgICAgIHN0cmluZyBuZXdTdHVkZW50TmFtZSA9IGlucHV0LlZhbHVlO1xyXG4gICAgICAgICAgICBpZiAobmV3U3R1ZGVudE5hbWUgPT0gXCJcIilcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHBsYW4uc3R1ZGVudHMuQWRkKG5ldyBVc2VyKG5ld1N0dWRlbnROYW1lLCBuZXcgYm9vbFs1XSwgbmV3IGludFs1XSwgbmV3IGludFs1XSkpO1xyXG4gICAgICAgICAgICBIVE1MRWxlbWVudCBkaXYgPSBHaWQoXCJzdHVkZW50c1wiKTtcclxuXHJcbiAgICAgICAgICAgIEhUTUxEaXZFbGVtZW50IGNhcmQgPSBuZXcgSFRNTERpdkVsZW1lbnQoKTtcclxuICAgICAgICAgICAgY2FyZC5DbGFzc05hbWUgPSBcImNhcmQgY2FyZC1ib2R5XCI7XHJcbiAgICAgICAgICAgIGNhcmQuSW5uZXJIVE1MICs9IFwiPHA+PHN0cm9uZz5cIiArIG5ld1N0dWRlbnROYW1lICsgXCI8L3N0cm9uZz48L3A+XCI7XHJcbiAgICAgICAgICAgIEhUTUxCdXR0b25FbGVtZW50IHNldEhvdXJzID0gbmV3IEhUTUxCdXR0b25FbGVtZW50KCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLk5hbWUgPSAocGxhbi5zdHVkZW50cy5Db3VudCAtIDEpLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLkNsYXNzTmFtZSA9IFwiYnRuIGJ0bi1wcmltYXJ5IHRlYWNoZXItY2xpY2tcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10b2dnbGVcIiwgXCJtb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10YXJnZXRcIiwgXCIjc2V0SG91cnNNb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuSW5uZXJIVE1MID0gXCJOYXN0YXZpdCBob2RpbnlcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuT25DbGljayArPSAoZSkgPT4geyBFZGl0SG91cnNDbGljayhzZXRIb3VycywgZmFsc2UpOyB9O1xyXG4gICAgICAgICAgICBjYXJkLkFwcGVuZENoaWxkKHNldEhvdXJzKTtcclxuICAgICAgICAgICAgZGl2LkFwcGVuZENoaWxkKGNhcmQpO1xyXG5cclxuICAgICAgICAgICAgaW5wdXQuVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBFZGl0SG91cnNDbGljayhvYmplY3Qgc2VuZGVyLCBib29sIHdhc1RlYWNoZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsYXN0U2V0V2FzVGVhY2hlciA9IHdhc1RlYWNoZXI7XHJcbiAgICAgICAgICAgIGxhc3RTZXRJZCA9IGludC5QYXJzZSgoc2VuZGVyIGFzIEhUTUxFbGVtZW50KS5HZXRBdHRyaWJ1dGUoXCJuYW1lXCIpKTtcclxuICAgICAgICAgICAgTGlzdDxVc2VyPiBzZWxlY3RlZENvbGxlY3Rpb24gPSAod2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzKTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLW1vbmRheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDApO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS10dWVzZGF5XCIpLklubmVySFRNTCA9IHNlbGVjdGVkQ29sbGVjdGlvbltsYXN0U2V0SWRdLkdldEhvdXJzSW5EYXkoMSk7XHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLXdlZG5lc2RheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDIpO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS10aHVyc2RheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDMpO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS1mcmlkYXlcIikuSW5uZXJIVE1MID0gc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0uR2V0SG91cnNJbkRheSg0KTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInNldFRpbWVNb2RhbEluZm9UZXh0XCIpLklubmVySFRNTCA9IFwiViB0ZW50byBkZW4gbcOhIFwiICsgc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0ubmFtZSArIFwiIMSNYXNcIjtcclxuXHJcbiAgICAgICAgICAgIFVwZGF0ZUxpc3RPZkRheXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgU29tZURheUVkaXRIb3Vyc0NsaWNrKG9iamVjdCBzZW5kZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkYXlJZCA9IGludC5QYXJzZSgoc2VuZGVyIGFzIEhUTUxFbGVtZW50KS5HZXRBdHRyaWJ1dGUoXCJuYW1lXCIpKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBnZXRUaW1lRnJvbUhIID0gR2lkKFwiZ2V0LXRpbWUtZnJvbS1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgICAgICB2YXIgZ2V0VGltZUZyb21NTSA9IEdpZChcImdldC10aW1lLWZyb20tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICAgICAgdmFyIGdldFRpbWVUb0hIID0gR2lkKFwiZ2V0LXRpbWUtdG8taGhcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICAgICAgdmFyIGdldFRpbWVUb01NID0gR2lkKFwiZ2V0LXRpbWUtdG8tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gbGFzdFNldFdhc1RlYWNoZXIgPyBwbGFuLnRlYWNoZXJzIDogcGxhbi5zdHVkZW50cztcclxuXHJcbiAgICAgICAgICAgIHZhciB1c3IgPSBjb2xsZWN0aW9uW2xhc3RTZXRJZF07XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHVzci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gPiAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgaG91cnNGcm9tID0gKGludClNYXRoLkZsb29yKHVzci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gLyA2MGQpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZUZyb21ISC5WYWx1ZSA9IGhvdXJzRnJvbS5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZUZyb21NTS5WYWx1ZSA9ICh1c3IubWludXRlc0Zyb21BdmFpbGFibGVbZGF5SWRdIC0gaG91cnNGcm9tICogNjApLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lRnJvbUhILlZhbHVlID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGdldFRpbWVGcm9tTU0uVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHVzci5taW51dGVzVG9BdmFpbGFibGVbZGF5SWRdID4gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IGhvdXJzVG8gPSAoaW50KU1hdGguRmxvb3IodXNyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXlJZF0gLyA2MGQpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZVRvSEguVmFsdWUgPSBob3Vyc1RvLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9NTS5WYWx1ZSA9ICh1c3IubWludXRlc1RvQXZhaWxhYmxlW2RheUlkXSAtIGhvdXJzVG8gKiA2MGQpLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9ISC5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9NTS5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgU2F2ZUhvdXJDaGFuZ2UoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gbGFzdFNldFdhc1RlYWNoZXIgPyBwbGFuLnRlYWNoZXJzIDogcGxhbi5zdHVkZW50cztcclxuXHJcbiAgICAgICAgICAgICAgICBpbnQgZnJvbSA9IChpbnQpKGludC5QYXJzZSgoR2lkKFwiZ2V0LXRpbWUtZnJvbS1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZSkgKiA2MCArIGludC5QYXJzZSgoR2lkKFwiZ2V0LXRpbWUtZnJvbS1tbVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgaW50IHRvID0gKGludCkoaW50LlBhcnNlKChHaWQoXCJnZXQtdGltZS10by1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZSkgKiA2MCArIGludC5QYXJzZSgoR2lkKFwiZ2V0LXRpbWUtdG8tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudCkuVmFsdWUpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZnJvbSArIFBsYW4ubGVzc29uTGVuZ3RoID4gdG8pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgUmVtb3ZlSG91ckluRGF5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gPSBmcm9tO1xyXG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXlJZF0gPSB0bztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCB7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgUmVtb3ZlSG91ckluRGF5KClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gbGFzdFNldFdhc1RlYWNoZXIgPyBwbGFuLnRlYWNoZXJzIDogcGxhbi5zdHVkZW50cztcclxuXHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gPSAwO1xyXG4gICAgICAgICAgICBjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc1RvQXZhaWxhYmxlW2RheUlkXSA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIFVwZGF0ZUxpc3RPZkRheXMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBsYXN0U2V0V2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzO1xyXG5cclxuICAgICAgICAgICAgLy8gU2V0IHRvIGFsbCBkYXlzOiBpZiB0aGVyZSBpcyBhdCBsZWFzdCB7UGxhbi5sZXNzb25MZW5ndGh9ICg1MCkgbWludXRlcyBiZXR3ZWVuIHR3byB0aW1lczogcmV0dXJuIHRpbWVzIGluIGZvcm1hdCBbXCJISDpNTSAtIEhIOk1NXCJdLCBlbHNlLCByZXR1cm4gXCJOZW7DrSBuYXN0YXZlbm9cIlxyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDU7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtXCIgKyBkYXlzW2ldKS5Jbm5lckhUTUwgPSBjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc1RvQXZhaWxhYmxlW2ldIC0gY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2ldIDwgUGxhbi5sZXNzb25MZW5ndGggPyBcIk5lbsOtIG5hc3RhdmVub1wiIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNaW51dGVzVG9Ib3Vyc0FuZE1pbnV0ZXMoY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2ldKSArIFwiIC0gXCIgKyBNaW51dGVzVG9Ib3Vyc0FuZE1pbnV0ZXMoY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNUb0F2YWlsYWJsZVtpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgc3RyaW5nIE1pbnV0ZXNUb0hvdXJzQW5kTWludXRlcyhpbnQgbWludXRlcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludCBob3VycyA9IChpbnQpTWF0aC5GbG9vcihtaW51dGVzIC8gNjBkKTtcclxuICAgICAgICAgICAgcmV0dXJuIGhvdXJzLlRvU3RyaW5nKFwiMDBcIikgKyBcIjpcIiArIChtaW51dGVzIC0gaG91cnMgKiA2MCkuVG9TdHJpbmcoXCIwMFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHN0cmluZyBNeU51bWJlclRvU3RyaW5nV2l0aEF0TGVhc3RUd29EaWdpdHNGb3JtYXQoaW50IG51bWJlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0cmluZyBudW0gPSBudW1iZXIuVG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgaWYgKG51bS5MZW5ndGggPT0gMSlcclxuICAgICAgICAgICAgICAgIG51bSA9IFwiMFwiICsgbnVtO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVtO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgSFRNTEVsZW1lbnQgR2lkKHN0cmluZyBpZCkge3JldHVybiBEb2N1bWVudC5HZXRFbGVtZW50QnlJZChpZCk7fVxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIEhUTUxDb2xsZWN0aW9uIEdjbChzdHJpbmcgY2xzKSB7cmV0dXJuIERvY3VtZW50LkJvZHkuR2V0RWxlbWVudHNCeUNsYXNzTmFtZShjbHMpO31cclxuICAgIH1cclxufSIsInVzaW5nIFN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3c7XHJcbnVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBQbGFuXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIGNvbnN0IGludCBsZXNzb25MZW5ndGggPSA1MDsgLy8gNDUgKyA1IHBhdXNlXHJcbiAgICAgICAgcHJpdmF0ZSBjb25zdCBpbnQgYnJlYWtBZnRlckxlc3NvbnMgPSAzOyAvLyBCcmVhayBhZnRlciAzIGxlc3NvbnNcclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IGJyZWFrQWZ0ZXJMZXNzb25zTGVuZ3RoID0gMTU7XHJcbiAgICAgICAgcHJpdmF0ZSBpbnRbXSBicmVha0FmdGVyTGVzc29uc1N0YXJ0ID0gbmV3IGludFtdIHsgaW50Lk1heFZhbHVlLCBpbnQuTWF4VmFsdWUsIGludC5NYXhWYWx1ZSwgaW50Lk1heFZhbHVlLCBpbnQuTWF4VmFsdWUgfTtcclxuXHJcbiAgICAgICAgcHVibGljIExpc3Q8VXNlcj4gc3R1ZGVudHM7XHJcbiAgICAgICAgcHVibGljIExpc3Q8VXNlcj4gdGVhY2hlcnM7XHJcblxyXG4gICAgICAgIHB1YmxpYyBQbGFuKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0dWRlbnRzID0gbmV3IExpc3Q8VXNlcj4oKTtcclxuICAgICAgICAgICAgdGVhY2hlcnMgPSBuZXcgTGlzdDxVc2VyPigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0cmluZyBHZW5lcmF0ZUhUTUwoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3RyaW5nIHMgPSBcIlwiO1xyXG5cclxuICAgICAgICAgICAgdmFyIG5vdFBvc1N0dWRlbnRzID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KSh4ID0+ICF4LmFzc2lnbmVkKSk7XHJcbiAgICAgICAgICAgIHZhciBwb3NTdHVkZW50cyA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4LmFzc2lnbmVkKSk7XHJcblxyXG4gICAgICAgICAgICBpZiAobm90UG9zU3R1ZGVudHMuQ291bnQoKSA+IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHMgKz0gc3RyaW5nLkZvcm1hdChcIjxkaXYgY2xhc3M9XFxcImFsZXJ0IGFsZXJ0LWRhbmdlciBhbGVydC1kaXNtaXNzaWJsZSBmYWRlIHNob3dcXFwicm9sZT1cXFwiYWxlcnRcXFwiXCIpK1xyXG5zdHJpbmcuRm9ybWF0KFwiPHA+TmVwb2RhxZlpbG8gc2UgbmFqw610IG3DrXN0byBwcm8gezB9IHogezF9IMW+w6Frxa8gXCIsbm90UG9zU3R1ZGVudHMuQ291bnQoKSxzdHVkZW50cy5Db3VudCkrXHJcbnN0cmluZy5Gb3JtYXQoXCIoezB9KTwvcD5cIixTdHJpbmcuSm9pbihcIiwgXCIsIG5vdFBvc1N0dWRlbnRzLlNlbGVjdDxzdHJpbmc+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBzdHJpbmc+KSh4ID0+IHgubmFtZSkpLlRvQXJyYXkoKSkpK1xyXG5zdHJpbmcuRm9ybWF0KFwiPGJ1dHRvbiB0eXBlPVxcXCJidXR0b25cXFwiIGNsYXNzPVxcXCJjbG9zZVxcXCIgZGF0YS1kaXNtaXNzPVxcXCJhbGVydFxcXCIgYXJpYS1sYWJlbD1cXFwiQ2xvc2VcXFwiPlwiKStcclxuc3RyaW5nLkZvcm1hdChcIjxzcGFuIGFyaWEtaGlkZGVuPVxcXCJ0cnVlXFxcIj7Dlzwvc3Bhbj48L2J1dHRvbj48L2Rpdj5cIik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN0cmluZ1tdIGRheXMgPSB7IFwiUG9uZMSbbMOtXCIsIFwiw5p0ZXLDvVwiLCBcIlN0xZllZGFcIiwgXCLEjHR2cnRla1wiLCBcIlDDoXRla1wiIH07XHJcblxyXG4gICAgICAgICAgICBmb3IgKGludCBkYXkgPSAwOyBkYXkgPCA1OyBkYXkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IHBvc3NlZFN0dWRlbnRzVG9kYXkgPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgIHMgKz0gc3RyaW5nLkZvcm1hdChcIjxkaXYgY2xhc3M9XFxcInJvd1xcXCI+PGRpdiBjbGFzcz1cXFwiY2FyZCBjYXJkLWJvZHlcXFwiPjxoMz57MH08L2gzPlwiLGRheXNbZGF5XSk7XHJcbiAgICAgICAgICAgICAgICAvLyA8ZGl2IGNsYXNzPVwiY2FyZCBjYXJkLWJvZHlcIj5QZXRyICgxMDowMCAtIDEwOjUwKTwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgIHZhciBwc3NkYXkgPSBwb3NTdHVkZW50cy5XaGVyZSgoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4geC5hc3NpZ25lZERheSA9PSBkYXkpKS5PcmRlckJ5PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGludD4pKHggPT4geC5hc3NpZ25lZE1pbnV0ZXMpKS5Ub0FycmF5KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBzc2RheS5MZW5ndGggPT0gMClcclxuICAgICAgICAgICAgICAgICAgICBzICs9IFwiPGk+TmEgdGVudG8gZGVuIG5lbsOtIG5pYyBuYXBsw6Fub3ZhbsOpaG88L2k+XCI7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBwc3NkYXkuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgVXNlciBjdXJyZW50ID0gcHNzZGF5W2ldO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJbnNlcnQgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocG9zc2VkU3R1ZGVudHNUb2RheSA9PSBicmVha0FmdGVyTGVzc29ucyAmJiBicmVha0FmdGVyTGVzc29uc1N0YXJ0W2RheV0gIT0gaW50Lk1heFZhbHVlKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW50IGJyZWFrRnJvbSA9IChpbnQpTWF0aC5GbG9vcihicmVha0FmdGVyTGVzc29uc1N0YXJ0W2RheV0gLyA2MGQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnQgYnJlYWtUbyA9IChpbnQpTWF0aC5GbG9vcigoYnJlYWtBZnRlckxlc3NvbnNTdGFydFtkYXldICsgYnJlYWtBZnRlckxlc3NvbnNMZW5ndGgpIC8gNjBkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZyBCcmVha0hGcm9tID0gYnJlYWtGcm9tLlRvU3RyaW5nKFwiMDBcIikgKyBcIjpcIiArIChicmVha0FmdGVyTGVzc29uc1N0YXJ0W2RheV0gLSBicmVha0Zyb20gKiA2MCkuVG9TdHJpbmcoXCIwMFwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nIEJyZWFrSFRvID0gYnJlYWtUby5Ub1N0cmluZyhcIjAwXCIpICsgXCI6XCIgKyAoYnJlYWtBZnRlckxlc3NvbnNTdGFydFtkYXldICsgYnJlYWtBZnRlckxlc3NvbnNMZW5ndGggLSBicmVha1RvICogNjApLlRvU3RyaW5nKFwiMDBcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzICs9IHN0cmluZy5Gb3JtYXQoXCI8ZGl2IGNsYXNzPVxcXCJjYXJkIGNhcmQtYm9keVxcXCIgc3R5bGU9XFxcImRpc3BsYXk6IGlubGluZTtcXFwiPjxzcGFuIHN0eWxlPVxcXCJmb250LXN0eWxlOiBpdGFsaWM7XFxcIj5QxZllc3TDoXZrYTwvc3Bhbj4gKHswfSAtIHsxfSk8L2Rpdj5cIixCcmVha0hGcm9tLEJyZWFrSFRvKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGhvdXJzRnJvbSA9IChpbnQpTWF0aC5GbG9vcihjdXJyZW50LmFzc2lnbmVkTWludXRlcyAvIDYwZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50IGhvdXJzVG8gPSAoaW50KU1hdGguRmxvb3IoKGN1cnJlbnQuYXNzaWduZWRNaW51dGVzICsgbGVzc29uTGVuZ3RoKSAvIDYwZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHN0cmluZyBoRnJvbSA9IGhvdXJzRnJvbS5Ub1N0cmluZyhcIjAwXCIpICsgXCI6XCIgKyAoY3VycmVudC5hc3NpZ25lZE1pbnV0ZXMgLSBob3Vyc0Zyb20gKiA2MCkuVG9TdHJpbmcoXCIwMFwiKTtcclxuICAgICAgICAgICAgICAgICAgICBzdHJpbmcgaFRvID0gaG91cnNUby5Ub1N0cmluZyhcIjAwXCIpICsgXCI6XCIgKyAoY3VycmVudC5hc3NpZ25lZE1pbnV0ZXMgKyBsZXNzb25MZW5ndGggLSBob3Vyc1RvICogNjApLlRvU3RyaW5nKFwiMDBcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gc3RyaW5nLkZvcm1hdChcIjxkaXYgY2xhc3M9XFxcImNhcmQgY2FyZC1ib2R5XFxcIj57MH0gKFwiLGN1cnJlbnQubmFtZSkrXHJcbnN0cmluZy5Gb3JtYXQoXCJ7MH0gLSB7MX0pPC9kaXY+XCIsaEZyb20saFRvKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zc2VkU3R1ZGVudHNUb2RheSsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHMgKz0gXCI8L2Rpdj48L2Rpdj5cIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBOT1RFOiBJIGFzc3VtZSB0aGVyZSBpcyBvbmx5IG9uZSB0ZWFjaGVyXHJcbiAgICAgICAgcHVibGljIHZvaWQgQ2FsYygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3IgKGludCBkYXkgPSAwOyBkYXkgPCA1OyBkYXkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoVXNlciB0ZWFjaGVyIGluIHRlYWNoZXJzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ZWFjaGVyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0gdGVhY2hlci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldID49IGxlc3Nvbkxlbmd0aClcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGVhY2hlci5kYXlzQXZhaWxhYmxlW2RheV0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKFVzZXIgc3R1ZGVudCBpbiBzdHVkZW50cylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc3R1ZGVudC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHN0dWRlbnQubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA+PSBsZXNzb25MZW5ndGgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnQuZGF5c0F2YWlsYWJsZVtkYXldID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuXHJcblxyXG4gICAgICAgICAgICAvLyBIT1cgVEhJUyBXT1JLUzpcclxuXHJcblxyXG4gICAgICAgICAgICAvLyAxLjApIFNldCBzdGFydCB0aW1lIGFzIHRlYWNoZXIncyBzdGFydCB0aW1lIG9mIHRoZSBkYXlcclxuICAgICAgICAgICAgLy8gMS4xKSBGaW5kIHN0dWRlbnQgd2hvIGhhcyBzdGFydGluZyB0aW1lIHRoZSBzYW1lIGFzIHRlYWNoZXIncyBzdGFydCB0aW1lLiBJZiB5ZXMsIHBvcyBhbmQgcmVwZWF0IDEpIDQ1IG1pbnV0ZXMgbGF0ZXIuXHJcbiAgICAgICAgICAgIC8vICAgICAgSWYgbm90LCBtb3ZlIGJ5IDUgbWludXRlcyBhbmQgdHJ5IGl0IGFnYWluIHdpdGggYWxsIHN0dWRlbnRzLiBJZiBoaXQgdGVhY2hlcidzIGVuZCB0aW1lLCBtb3ZlIHRvIG5leHQgZGF5XHJcblxyXG4gICAgICAgICAgICAvLyBPUFRJTUFMSVpBVElPTjogQ2hlY2sgaWYgYm90aCB0ZWFjaGVyIGFuZCBzdHVkZW50cyBoYXZlIHNvbWUgbWludXRlcyBpbiBjb21tb24uIElmIG5vdCwgc2tpcCB0aGlzIGRheVxyXG5cclxuXHJcblxyXG5cclxuICAgICAgICAgICAgLy8gSWYgYWxsIHN0dWRlbnRzIGFyZSBwb3NpdGlvbmVkLCBlbmQuIElmIG5vdCwgaGVhZCB0byBzdGVwIDJcclxuXHJcbiAgICAgICAgICAgIC8vIDIuMCkgSSBoYXZlIHNvbWUgc3R1ZGVudHMgd2l0aG91dCBhc3NpZ25lZCBob3Vycy4gUGljayBzdHVkZW50IHdpdGggbGVhc3QgcG9zc2libGUgaG91cnMuIEZpbmQgYWxsXHJcbiAgICAgICAgICAgIC8vICAgICAgaG91cnMgd2hlcmUgSSBjYW4gcG9zIHRoaXMgc3R1ZGVudCBpbiBhbGwgZGF5cy5cclxuICAgICAgICAgICAgLy8gMi4xKSBDaG9vc2UgdGhlIHBvc2l0aW9uIHdoZXJlIHRoZSBsZWFzdCB1bmFzc2lnbmVkIHN0dWRlbnRzIGNhbiBnby4gQWZ0ZXIgdGhhdCwgY2hvb3NlIHBvc2l0aW9uIHdoZXJlXHJcbiAgICAgICAgICAgIC8vICAgICAgaXMgc3R1ZGVudCB3aXRoIG1vc3QgZnJlZSB0aW1lXHJcbiAgICAgICAgICAgIC8vIDIuMikgU3dhcCB0aG9zZSBzdHVkZW50c1xyXG4gICAgICAgICAgICAvLyAyLjMpIFJlcGVhdC4gSWYgYWxyZWFkeSByZXBlYXRlZCBOIHRpbWVzLCB3aGVyZSBOIGlzIG51bWJlciBvZiB1bmFzc2lnbmVkIHN0dWRlbnRzIGF0IHRoZSBiZWdnaW5pbmcgb2YgcGhhc2UgMixcclxuICAgICAgICAgICAgLy8gICAgICBlbmQsIHNob3cgYWxsIHBvc2l0aW9uZWQgc3R1ZGVudHMgYW5kIHJlcG9ydCBmYWlsdXJlXHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgIGlmICh0ZWFjaGVycy5Db3VudCAhPSAxIHx8IHN0dWRlbnRzLkNvdW50ID09IDApXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAvLyBSZXNldCBwcmV2aW91cyBjYWxjdWxhdGlvbnNcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBzdHVkZW50cy5Db3VudDsgaSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzdHVkZW50c1tpXS5hc3NpZ25lZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgc3R1ZGVudHNbaV0uYXNzaWduZWREYXkgPSAtMTtcclxuICAgICAgICAgICAgICAgIHN0dWRlbnRzW2ldLmFzc2lnbmVkTWludXRlcyA9IC0xO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBGaXJzdCBzdGFnZVxyXG4gICAgICAgICAgICAvL1RyeVRvUG9zQWxsU3R1ZGVudHNWZXIyKCk7XHJcbiAgICAgICAgICAgIC8vIFNlY29uZCBzdGFnZVxyXG4gICAgICAgICAgICAvL1Bvc05vdFBvc3NlZFN0dWRlbnRzKCk7XHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgIC8vIE9SIEkgY291bGQgZG8gaXQgdGhpcyB3YXk6XHJcblxyXG4gICAgICAgICAgICAvLyAxICAgICAgICAgICAgRm9yIGFsbCBkYXlzIHdoZXJlIGF0IGxlYXN0IDEgdGVhY2hlciArIDEgc3R1ZGVudCBoYXMgdGltZSBhbmQgc29tZW9uZSBpcyBub3QgYXNzaWduZWQgeWV0XHJcbiAgICAgICAgICAgIC8vIDEuMSAgICAgICAgICBQb3MgMyBzdHVkZW50cyB0aGlzIHdheTogUG9zIHN0dWRlbnQgdGhhdCBjYW4gYmUgdGhlcmUgdGhlIGVhcmxpZXN0IHRpbWUuIElmIHRoZXJlIGlzIHNvbWVvbmUsIHRoYXQgY2FuIGJlIHRoZXJlXHJcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICA8NTAgbWludXRlcyBhZnRlciB0aGUgc3R1ZGVudCBhbmQgaGFzIGxlc3MgdGltZSwgcGxhY2UgaGltIGluc3RlYWRcclxuICAgICAgICAgICAgLy8gMS4yICAgICAgICAgIFBsYWNlIGEgYnJlYWtcclxuICAgICAgICAgICAgLy8gMS4zICAgICAgICAgIFBsYWNlIGFzIG1hbnkgc3R1ZGVudHMgYXMgeW91IGNhblxyXG5cclxuICAgICAgICAgICAgLy8gMiAgICAgICAgICAgIEZvciBhbGwgdW5hc3NpZ25lZCBzdHVkZW50czpcclxuICAgICAgICAgICAgLy8gMi4xICAgICAgICAgIEdldCBhbGwgc3R1ZGVudHMgdGhhdCBhcmUgYmxvY2tpbmcgaGltLiBEbyB0aGlzIGZvciBhbGwgKG9yZGVyZWQgYnkgbnVtYmVyIG9mIHRpbWUpIG9mIHRoZW0gdW5sZXNzIHRoZSBzdHVkZW50IGlzIHBvc3NlZDpcclxuICAgICAgICAgICAgLy8gMi4xLjEgICAgICAgIFN3YXAgdGhlc2Ugc3R1ZGVudHMuIFJlbWVtYmVyIHRvIG1vdmUgb3RoZXIgc3R1ZGVudHMgYmVoaW5kIGhpbSBpZiBuZWNjZXNzYXJ5LiBCZSBjYXJlZnVsIGlmIHNvbWVvbmUgbG9zZXMgcG9zaXRpb24gYmVjYXVzZSBvZiB0aGlzXHJcbiAgICAgICAgICAgIC8vIDIuMS4yICAgICAgICBJZiB0aGVzZSBzd2FwcGVkIHN0dWRlbnRzICh0aGF0IGRvbid0IGhhdmUgdGltZSBub3cpIGRvbid0IGhhdmUgW2RpcmVjdF0gcGxhY2UgdG8gc3RheSwgcmV2ZXJ0IGNoYW5nZXNcclxuICAgICAgICAgICAgLy8gMi4xLjMgICAgICAgIEVsc2UsIHBsYWNlIHN0dWRlbnRzIHRoZXJlIGFuZCBnbyBiYWNrIHRvIFsyXVxyXG5cclxuXHJcbiAgICAgICAgICAgIC8vUG9zU3R1ZGVudHMoKTtcclxuICAgICAgICAgICAgLy9JRG9udENhcmVKdXN0UG9zc1N0dWRlbnRzKCk7IC8vIFRISVMgV0FTTlQgQ09NTUVOVEVEXHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgIC8vIFVTSU5HIEZMT1dTOlxyXG5cclxuICAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIERvSXRVc2luZ0Zsb3dzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKEV4Y2VwdGlvbiBleClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTG9nLldyaXRlKGV4LCBMb2cuU2V2ZXJpdHkuQ3JpdGljYWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgVHJ5VG9Qb3NBbGxTdHVkZW50c1ZlcjIoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgVXNlciB0ZWFjaGVyID0gdGVhY2hlcnNbMF07XHJcblxyXG4gICAgICAgICAgICBmb3IgKGludCBkYXkgPSAwOyBkYXkgPCA1OyBkYXkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRlYWNoZXIubWludXRlc1RvQXZhaWxhYmxlW2RheV0gLSB0ZWFjaGVyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPCBsZXNzb25MZW5ndGgpXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHN0dWRlbnRzVG9kYXkgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4gIXguYXNzaWduZWQgJiYgeC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA+PSBsZXNzb25MZW5ndGgpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5PcmRlckJ5PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGludD4pKHggPT4geC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSkpLlRvQXJyYXkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpbnQgcG9zc2VkSG91cnMgPSAwO1xyXG4gICAgICAgICAgICAgICAgaW50IG1pbnV0ZUJyZWFrID0gLTE7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBzdHVkZW50c1RvZGF5Lkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IE11emUgc2Ugc3RhdCwgemUgdGVuIHN0dWRlbnQgcyBuZWptaW4gdmVsbnlobyBjYXN1IGJ1ZGUgbWVybW9tb2NpIHZlcHJlZHUgYSBidWRlIGJsb2tvdmF0IG1pc3RvIHBybyBqaW55aG8sIGkga2R5eiBieSBzZVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHYgcG9ob2RlIHZlc2VsIGplc3RlIGRvemFkdS4gVHJlYmEgQSBtYSBtaW4gY2FzdSBuZXogQi4gQTogMTI6MzAtMTU6MDAsIEI6IDEyOjAwLTE3OjAwLCB2eXNsZWRlayBidWRlXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQTogMTI6MzAtMTM6MjAsIEI6IDEzOjIwLTE0OjEwIE1JU1RPIEIgOjEyOjAwIC0gMTI6NTAsIEE6IDEyOjUwLTEzOjQwXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaW50IG1pbnV0ZSA9IHN0dWRlbnRzVG9kYXlbaV0ubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XTsgbWludXRlIDw9IHN0dWRlbnRzVG9kYXlbaV0ubWludXRlc1RvQXZhaWxhYmxlW2RheV07IG1pbnV0ZSArPSA1KVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRlYWNoZXIubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA+IG1pbnV0ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWludXRlID0gdGVhY2hlci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldIC0gNTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGVhY2hlci5taW51dGVzVG9BdmFpbGFibGVbZGF5XSA8IG1pbnV0ZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1pbnV0ZSA+PSBtaW51dGVCcmVhayAmJiBtaW51dGUgPD0gbWludXRlQnJlYWsgKyBicmVha0FmdGVyTGVzc29uc0xlbmd0aClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0dWRlbnRzSW5UaGlzVGltZUZyYW1lID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHNUb2RheSwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4geC5hc3NpZ25lZCAmJiB4LmFzc2lnbmVkRGF5ID09IGRheSAmJiB4LmFzc2lnbmVkTWludXRlcyA+PSBtaW51dGUgLSBsZXNzb25MZW5ndGggJiYgeC5hc3NpZ25lZE1pbnV0ZXMgPD0gbWludXRlICsgbGVzc29uTGVuZ3RoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3R1ZGVudHNJblRoaXNUaW1lRnJhbWUuQ291bnQoKSA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc3NlZEhvdXJzKys7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50c1RvZGF5W2ldLmFzc2lnbmVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHNUb2RheVtpXS5hc3NpZ25lZERheSA9IGRheTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHNUb2RheVtpXS5hc3NpZ25lZE1pbnV0ZXMgPSBtaW51dGU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocG9zc2VkSG91cnMgPT0gYnJlYWtBZnRlckxlc3NvbnMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3NlZEhvdXJzID0gaW50Lk1pblZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTG9nLldyaXRlKFN0cmluZy5Kb2luKFwiLCBcIiwgU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHNUb2RheSwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4geC5hc3NpZ25lZCkpLk9yZGVyQnk8aW50PigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgaW50PikoeCA9PiB4LmFzc2lnbmVkTWludXRlcykpLlNlbGVjdDxzdHJpbmc+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBzdHJpbmc+KSh4ID0+IHgubmFtZSkpLlRvQXJyYXkoKSksIExvZy5TZXZlcml0eS5JbmZvKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludCBtaW51dGVPZkxhc3RQb3NzZWRTdHVkZW50VG9kYXkgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50c1RvZGF5LChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4LmFzc2lnbmVkKSkuT3JkZXJCeTxpbnQ+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBpbnQ+KSh4ID0+IHguYXNzaWduZWRNaW51dGVzKSkuVG9BcnJheSgpWzJdLmFzc2lnbmVkTWludXRlcyArIGxlc3Nvbkxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbnV0ZUJyZWFrID0gbWludXRlT2ZMYXN0UG9zc2VkU3R1ZGVudFRvZGF5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtBZnRlckxlc3NvbnNTdGFydFtkYXldID0gbWludXRlQnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgUG9zTm90UG9zc2VkU3R1ZGVudHMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIHVucG9zc2VkU3R1ZGVudHMgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHN0dWRlbnQgPT4gIXN0dWRlbnQuYXNzaWduZWQpKS5Ub0xpc3QoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh1bnBvc3NlZFN0dWRlbnRzLkNvdW50ID09IDApXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBib29sIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAoY2hhbmdlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGFuZ2UgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIC8vIFBpY2sgb25lIG9mIHVucG9zZWQgc3R1ZGVudHMgd2l0aCBsb3dlc3QgbnVtYmVyIG9mIHBvc3NpYmxlIGhvdXJzXHJcbiAgICAgICAgICAgICAgICBpbnQgbG93ZXN0U3R1ZGVudEluZGV4ID0gLTE7XHJcbiAgICAgICAgICAgICAgICBpbnQgbG93ZXN0U3R1ZGVudE1pbnV0ZXMgPSBpbnQuTWF4VmFsdWU7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHVucG9zc2VkU3R1ZGVudHMuQ291bnQ7IGkrKylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBVc2VyIHMgPSB1bnBvc3NlZFN0dWRlbnRzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBtaW51dGVzID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGludCBkYXkgPSAwOyBkYXkgPCA1OyBkYXkrKylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbnV0ZXMgKz0gcy5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHMubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1pbnV0ZXMgPCBsb3dlc3RTdHVkZW50TWludXRlcylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvd2VzdFN0dWRlbnRJbmRleCA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvd2VzdFN0dWRlbnRNaW51dGVzID0gbWludXRlcztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBVc2VyIHNlbGVjdFN0dWRlbnQgPSB1bnBvc3NlZFN0dWRlbnRzW2xvd2VzdFN0dWRlbnRJbmRleF07XHJcblxyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIFRyeVRvUG9zQWxsU3R1ZGVudHMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gQXNzdW1pbmcgSSBoYXZlIGp1c3Qgb25lIHRlYWNoZXJcclxuICAgICAgICAgICAgVXNlciB0ZWFjaGVyID0gdGVhY2hlcnNbMF07XHJcblxyXG4gICAgICAgICAgICBmb3IgKGludCBkYXkgPSAwOyBkYXkgPCA1OyBkYXkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLy8gRm9yIGFsbCBkYXlzLCBza2lwIGRheSBpZiBlaXRoZXIgYWxsIHN0dWRlbnRzIG9yIHRlYWNoZXIgYXJlIGJ1c3lcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBHZXQgYWxsIHN0dWRlbnRzIHRoYXQgaGF2ZSBhdCBsZWFzdCA1MG1pbnMgdGltZSB0b2RheSBhbmQgc3RpbGwgZG9uJ3QgaGF2ZSBhbnl0aGluZyBhc3NpZ25lZFxyXG4gICAgICAgICAgICAgICAgdmFyIHN0dWRlbnRzRm9yVGhpc0RheSA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0geC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldID49IGxlc3Nvbkxlbmd0aCAmJiAheC5hc3NpZ25lZCkpLlRvQXJyYXkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGVhY2hlci5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHRlYWNoZXIubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA8IGxlc3Nvbkxlbmd0aCB8fCAvLyBJZiB0aGUgdGVhY2hlciBkb24ndCBoYXZlIGZ1bGwgNTAgbWludXRlcyBvZiB0aW1lXHJcbiAgICAgICAgICAgICAgICAgICBzdHVkZW50c0ZvclRoaXNEYXkuTGVuZ3RoID09IDApIC8vIE9yIGlmIHRoZXJlIGlzIG5vIHN0dWRlbnQgd2l0aCBhdCBsZWFzdCA1MCBtaW50dWVzIG9mIHRpbWVcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEdvIGZvciBhbGwgdGhlIHRlYWNoZXIncyBtaW51dGVzIHRvZGF5XHJcblxyXG4gICAgICAgICAgICAgICAgaW50IGhvdXJzRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBtaW51dGUgPSB0ZWFjaGVyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV07IG1pbnV0ZSA8PSB0ZWFjaGVyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldOyBtaW51dGUgKz0gNSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaG91cnNFbGFwc2VkID09IGJyZWFrQWZ0ZXJMZXNzb25zKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaG91cnNFbGFwc2VkID0gaW50Lk1pblZhbHVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbWludXRlICs9IGJyZWFrQWZ0ZXJMZXNzb25zTGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHVkZW50c0luVGhpc1Rlcm0gPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50c0ZvclRoaXNEYXksKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KShzdHVkZW50ID0+IHN0dWRlbnQubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA8PSBtaW51dGUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnQubWludXRlc1RvQXZhaWxhYmxlW2RheV0gPj0gbWludXRlICsgbGVzc29uTGVuZ3RoKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5PcmRlckJ5PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGludD4pKHggPT4geC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSkpLlRvQXJyYXkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgVXNlciBjaG9zZW5TdHVkZW50ID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5GaXJzdE9yRGVmYXVsdDxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHNJblRoaXNUZXJtKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNob3NlblN0dWRlbnQgPT0gbnVsbClcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNob3NlblN0dWRlbnQuYXNzaWduZWRNaW51dGVzID0gbWludXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNob3NlblN0dWRlbnQuYXNzaWduZWREYXkgPSBkYXk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hvc2VuU3R1ZGVudC5hc3NpZ25lZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1pbnV0ZSArPSBsZXNzb25MZW5ndGggLSA1O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBob3Vyc0VsYXBzZWQrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIFBvc1N0dWRlbnRzKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGRheSA9IDA7IGRheSA8IDU7IGRheSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyBBc3N1bWluZyBJIGhhdmUganVzdCBvbmUgdGVhY2hlclxyXG4gICAgICAgICAgICAgICAgVXNlciB0ZWFjaGVyID0gdGVhY2hlcnNbMF07XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gR2V0IGFsbCBzdHVkZW50cyB0aGF0IGhhdmUgYXQgbGVhc3QgNTBtaW5zIHRpbWUgdG9kYXkgYW5kIHN0aWxsIGRvbid0IGhhdmUgYW55dGhpbmcgYXNzaWduZWRcclxuICAgICAgICAgICAgICAgIHZhciBzdHVkZW50c0ZvclRoaXNEYXkgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4geC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA+PSBsZXNzb25MZW5ndGggJiYgIXguYXNzaWduZWQpKVxyXG4gICAgICAgICAgICAgICAgICAgIC5PcmRlckJ5PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGludD4pKHggPT4geC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSkpLlRvQXJyYXkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGVhY2hlci5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHRlYWNoZXIubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA8IGxlc3Nvbkxlbmd0aCB8fCAhdGVhY2hlci5kYXlzQXZhaWxhYmxlW2RheV0gfHwgLy8gSWYgdGhlIHRlYWNoZXIgZG9uJ3QgaGF2ZSBmdWxsIDUwIG1pbnV0ZXMgb2YgdGltZVxyXG4gICAgICAgICAgICAgICAgICAgc3R1ZGVudHNGb3JUaGlzRGF5Lkxlbmd0aCA9PSAwKSAvLyBPciBpZiB0aGVyZSBpcyBubyBzdHVkZW50IHdpdGggYXQgbGVhc3QgNTAgbWludHVlcyBvZiB0aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgIGludCBwb3NzZWQgPSAwO1xyXG4gICAgICAgICAgICAgICAgLy8gR28gdGhydSBhbGwgdGVhY2hlciBob3Vyc1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgdGltZSA9IHRlYWNoZXIubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XTsgdGltZSA8PSB0ZWFjaGVyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0gbGVzc29uTGVuZ3RoOyB0aW1lICs9IDUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTGV0cyB0YWtlIGEgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocG9zc2VkID09IDMpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha0FmdGVyTGVzc29uc1N0YXJ0W2RheV0gPSB0aW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lICs9IGJyZWFrQWZ0ZXJMZXNzb25zTGVuZ3RoIC0gNTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zc2VkKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBzdHVkZW50IGF2YWlsYWJsZVxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHVkZW50c0F2YWlsYWJsZSA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzRm9yVGhpc0RheSwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4geC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldIDw9IHRpbWUgJiYgeC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSA+PSB0aW1lICsgbGVzc29uTGVuZ3RoKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLk9yZGVyQnk8aW50PigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgaW50PikoeCA9PiB4Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0pKTsgLy8gVE9ETzogS2R5eiBqc291IGR2YSBzZSBzdGVqbnltYSBob2RpbmFtYSwgdXByZWRub3N0bml0IHRvaG8sIGtkbyBtYSBtaW4gY2FzdVxyXG4gICAgICAgICAgICAgICAgICAgIExvZy5Xcml0ZShTdHJpbmcuSm9pbihcIiwgXCIsIHN0dWRlbnRzQXZhaWxhYmxlLlNlbGVjdDxzdHJpbmc+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBzdHJpbmc+KSh4ID0+IHgubmFtZSArIFwiOiBcIiArIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSkpKSwgTG9nLlNldmVyaXR5LkluZm8pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBVc2VyIGNob3NlblN0dWRlbnQgPSBzdHVkZW50c0F2YWlsYWJsZS5GaXJzdE9yRGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2hvc2VuU3R1ZGVudCA9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgY2hvc2VuU3R1ZGVudC5hc3NpZ25lZE1pbnV0ZXMgPSB0aW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIGNob3NlblN0dWRlbnQuYXNzaWduZWREYXkgPSBkYXk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hvc2VuU3R1ZGVudC5hc3NpZ25lZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRpbWUgKz0gbGVzc29uTGVuZ3RoIC0gNTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zc2VkKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBCcnV0ZUZvcmNlU3R1ZGVudHMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgVXNlciB0ZWFjaGVyID0gdGVhY2hlcnNbMF07XHJcblxyXG4gICAgICAgICAgICBmb3IgKGludCBkYXkgPSAwOyBkYXkgPCA1OyBkYXkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRlYWNoZXIuZGF5c0F2YWlsYWJsZVtkYXldKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIExpc3Q8QnJ1dGVGb3JjZWRTdHVkZW50PiByZXN1bHQgPSBCcnV0ZUZvcmNlU3R1ZGVudHMoZGF5LCB0ZWFjaGVyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0sIHRlYWNoZXIubWludXRlc1RvQXZhaWxhYmxlW2RheV0sIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgcmVzdWx0LkNvdW50OyBpKyspXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbaV0uc3R1ZGVudC5hc3NpZ25lZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtpXS5zdHVkZW50LmFzc2lnbmVkRGF5ID0gZGF5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbaV0uc3R1ZGVudC5hc3NpZ25lZE1pbnV0ZXMgPSByZXN1bHRbaV0ubWludXRlc0Zyb207XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIExpc3Q8QnJ1dGVGb3JjZWRTdHVkZW50PiBCcnV0ZUZvcmNlU3R1ZGVudHMoaW50IGRheSwgaW50IHN0YXJ0VGltZSwgaW50IGVuZFRpbWUsIGludCBzdHVkZW50c1Bvc3NlZClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChzdGFydFRpbWUgPj0gZW5kVGltZSAtIGxlc3Nvbkxlbmd0aClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBMaXN0PEJydXRlRm9yY2VkU3R1ZGVudD4oKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIHN0YXJ0U3R1ZGVudCA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiAheC5hc3NpZ25lZCAmJiB4Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPj0gc3RhcnRUaW1lICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIDw9IGVuZFRpbWUpKS5PcmRlckJ5PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGludD4pKHggPT4geC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldKSkuRmlyc3RPckRlZmF1bHQoKTtcclxuICAgICAgICAgICAgaWYgKHN0YXJ0U3R1ZGVudCA9PSBudWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBzdGFydFRpbWUgKz0gNTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBCcnV0ZUZvcmNlU3R1ZGVudHMoZGF5LCBzdGFydFRpbWUsIGVuZFRpbWUsIHN0dWRlbnRzUG9zc2VkKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaW50IHN0YXJ0U3R1ZGVudFN0YXJ0VGltZSA9IHN0YXJ0U3R1ZGVudC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldO1xyXG5cclxuXHJcbiAgICAgICAgICAgIHN0dWRlbnRzUG9zc2VkKys7XHJcbiAgICAgICAgICAgIHN0YXJ0VGltZSArPSBsZXNzb25MZW5ndGg7XHJcbiAgICAgICAgICAgIGlmIChzdHVkZW50c1Bvc3NlZCA9PSBicmVha0FmdGVyTGVzc29ucylcclxuICAgICAgICAgICAgICAgIHN0YXJ0VGltZSArPSBicmVha0FmdGVyTGVzc29uc0xlbmd0aDtcclxuICAgICAgICAgICAgdmFyIGFub3RoZXJTdHVkZW50cyA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiAheC5hc3NpZ25lZCAmJiB4Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPiBzdGFydFN0dWRlbnRTdGFydFRpbWUgLSBsZXNzb25MZW5ndGggJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSA8PSBlbmRUaW1lICYmIHggIT0gc3RhcnRTdHVkZW50KSk7XHJcblxyXG4gICAgICAgICAgICBMb2cuV3JpdGUoXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIsIExvZy5TZXZlcml0eS5JbmZvKTtcclxuICAgICAgICAgICAgTG9nLldyaXRlKHN0YXJ0U3R1ZGVudC5uYW1lICsgXCIsXCIsIExvZy5TZXZlcml0eS5JbmZvKTtcclxuICAgICAgICAgICAgTG9nLldyaXRlKFN0cmluZy5Kb2luKFwiLFwiLCBhbm90aGVyU3R1ZGVudHMuU2VsZWN0PHN0cmluZz4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIHN0cmluZz4pKHggPT4geC5uYW1lKSkpLCBMb2cuU2V2ZXJpdHkuSW5mbyk7XHJcblxyXG4gICAgICAgICAgICBMaXN0PExpc3Q8QnJ1dGVGb3JjZWRTdHVkZW50Pj4gcHJlUmVzdWx0ID0gbmV3IExpc3Q8TGlzdDxCcnV0ZUZvcmNlZFN0dWRlbnQ+PigpO1xyXG5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTGlzdDxCcnV0ZUZvcmNlZFN0dWRlbnQ+IHBvc3NSZXN1bHQgPSBuZXcgTGlzdDxCcnV0ZUZvcmNlZFN0dWRlbnQ+KCk7XHJcbiAgICAgICAgICAgICAgICBwb3NzUmVzdWx0LkFkZChuZXcgQnJ1dGVGb3JjZWRTdHVkZW50KHN0YXJ0U3R1ZGVudFN0YXJ0VGltZSwgc3RhcnRTdHVkZW50KSk7XHJcbiAgICAgICAgICAgICAgICBMaXN0PEJydXRlRm9yY2VkU3R1ZGVudD4gbmV3U3R1ZGVudHMgPSBCcnV0ZUZvcmNlU3R1ZGVudHMoZGF5LCBzdGFydFRpbWUsIGVuZFRpbWUsIHN0dWRlbnRzUG9zc2VkKTtcclxuICAgICAgICAgICAgICAgIGlmIChuZXdTdHVkZW50cyAhPSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc3NSZXN1bHQuQWRkUmFuZ2UobmV3U3R1ZGVudHMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcHJlUmVzdWx0LkFkZChwb3NzUmVzdWx0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3JlYWNoICh2YXIgYW5vdGhlclN0dWRlbnQgaW4gYW5vdGhlclN0dWRlbnRzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBMaXN0PEJydXRlRm9yY2VkU3R1ZGVudD4gcG9zc2libGVSZXN1bHQgPSBuZXcgTGlzdDxCcnV0ZUZvcmNlZFN0dWRlbnQ+KCk7XHJcbiAgICAgICAgICAgICAgICBwb3NzaWJsZVJlc3VsdC5BZGQobmV3IEJydXRlRm9yY2VkU3R1ZGVudChNYXRoLk1heChzdGFydFRpbWUsIGFub3RoZXJTdHVkZW50Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0pLCBhbm90aGVyU3R1ZGVudCkpO1xyXG4gICAgICAgICAgICAgICAgTGlzdDxCcnV0ZUZvcmNlZFN0dWRlbnQ+IG5ld1N0dWRlbnRzID0gQnJ1dGVGb3JjZVN0dWRlbnRzKGRheSwgc3RhcnRUaW1lLCBlbmRUaW1lLCBzdHVkZW50c1Bvc3NlZCk7XHJcbiAgICAgICAgICAgICAgICBpZiAobmV3U3R1ZGVudHMgIT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NzaWJsZVJlc3VsdC5BZGRSYW5nZShuZXdTdHVkZW50cyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBwcmVSZXN1bHQuQWRkKHBvc3NpYmxlUmVzdWx0KTtcclxuICAgICAgICAgICAgfVxyXG5TeXN0ZW0uTGlucS5FbnVtZXJhYmxlLk9yZGVyQnlEZXNjZW5kaW5nPGdsb2JhbDo6U3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWMuTGlzdDxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuQnJ1dGVGb3JjZWRTdHVkZW50PixpbnQ+KFxyXG4gICAgICAgICAgICBwcmVSZXN1bHQsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYy5MaXN0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5CcnV0ZUZvcmNlZFN0dWRlbnQ+LCBpbnQ+KSh4ID0+IHguQ291bnQpKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkZpcnN0PGdsb2JhbDo6U3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWMuTGlzdDxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuQnJ1dGVGb3JjZWRTdHVkZW50Pj4ocHJlUmVzdWx0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBJRG9udENhcmVKdXN0UG9zc1N0dWRlbnRzKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFVzZXIgdGVhY2hlciA9IHRlYWNoZXJzWzBdO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpbnQgZGF5ID0gMDsgZGF5IDwgNTsgZGF5KyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0ZWFjaGVyLmRheXNBdmFpbGFibGVbZGF5XSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnQgc3RhcnRUaW1lID0gdGVhY2hlci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldO1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBlbmRUaW1lID0gdGVhY2hlci5taW51dGVzVG9BdmFpbGFibGVbZGF5XTtcclxuICAgICAgICAgICAgICAgICAgICBpbnQgc3R1ZGVudHNQb3NzZWQgPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGludCBtaW51dGUgPSAwOyBtaW51dGUgPCBlbmRUaW1lIC0gc3RhcnRUaW1lOylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdHVkZW50c1JpZ2h0Tm93ID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KSh4ID0+ICF4LmFzc2lnbmVkICYmIHguZGF5c0F2YWlsYWJsZVtkYXldICYmIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA8PSBzdGFydFRpbWUgKyBtaW51dGUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldID49IHN0YXJ0VGltZSArIG1pbnV0ZSArIGxlc3Nvbkxlbmd0aCkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0dWRlbnRzUmlnaHROb3cuQ291bnQoKSA9PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW51dGUrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3R1ZGVudFRvUG9zID0gc3R1ZGVudHNSaWdodE5vdy5GaXJzdCgpOyAvLyBUT0RPOiBDaG9vc2Ugc29tZW9uZSBiZXR0ZXIgd2F5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRUb1Bvcy5hc3NpZ25lZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRUb1Bvcy5hc3NpZ25lZERheSA9IGRheTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudFRvUG9zLmFzc2lnbmVkTWludXRlcyA9IHN0YXJ0VGltZSArIG1pbnV0ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzUG9zc2VkKys7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW51dGUgKz0gbGVzc29uTGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0dWRlbnRzUG9zc2VkID09IGJyZWFrQWZ0ZXJMZXNzb25zKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha0FmdGVyTGVzc29uc1N0YXJ0W2RheV0gPSBzdGFydFRpbWUgKyBtaW51dGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW51dGUgKz0gYnJlYWtBZnRlckxlc3NvbnNMZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50c1Bvc3NlZCsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgRG9JdFVzaW5nRmxvd3MoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgRmxvdyBmbG93ID0gbmV3IEZsb3codGVhY2hlcnNbMF0sIHN0dWRlbnRzKTtcclxuICAgICAgICAgICAgLy8gQWx0ZXIgZmxvd1xyXG5cclxuICAgICAgICAgICAgLypmbG93LkRFQlVHX0NsZWFyTm9kZXMoKTtcclxuICAgICAgICAgICAgTm9kZSByb290ID0gbmV3IE5vZGUoXCJJbnB1dFwiLCAtMSwgTm9kZS5Ob2RlVHlwZS5JbnB1dCk7XHJcbiAgICAgICAgICAgIE5vZGUgc2luayA9IG5ldyBOb2RlKFwiT3V0cHV0XCIsIC0xLCBOb2RlLk5vZGVUeXBlLk91dHB1dCk7XHJcbiAgICAgICAgICAgIC8vIENyZWF0ZSBzdHVkZW50cyAxIGFuZCAyXHJcbiAgICAgICAgICAgIE5vZGUgczEgPSBuZXcgTm9kZShcIlN0dWRlbnQgMVwiLCAtMSwgTm9kZS5Ob2RlVHlwZS5EZWZhdWx0KTtcclxuICAgICAgICAgICAgTm9kZSBzMiA9IG5ldyBOb2RlKFwiU3R1ZGVudCAyXCIsIC0xLCBOb2RlLk5vZGVUeXBlLkRlZmF1bHQpO1xyXG4gICAgICAgICAgICAvLyBDcmVhdGUgdGltZXMgKG5vdCBvdmVybGFwcGluZylcclxuICAgICAgICAgICAgTm9kZSB0MSA9IG5ldyBOb2RlKFwiVGltZSAoMTAwKVwiLCAxMDAsIE5vZGUuTm9kZVR5cGUuRGVmYXVsdCk7XHJcbiAgICAgICAgICAgIE5vZGUgdDIgPSBuZXcgTm9kZShcIlRpbWUgKDcwMClcIiwgNzAwLCBOb2RlLk5vZGVUeXBlLkRlZmF1bHQpO1xyXG4gICAgICAgICAgICAvLyBBZGQgdGltZSBjaHVua1xyXG4gICAgICAgICAgICBOb2RlIHRjaCA9IG5ldyBOb2RlKFwiVGltZSBDaHVuayBOb2RlXCIsIC0xLCBOb2RlLk5vZGVUeXBlLkRlZmF1bHQpO1xyXG4gICAgICAgICAgICAvLyBBZGQgcGF0aHMgZnJvbSByb290IHRvIHN0dWRlbnRzIGFuZCBmcm9tIHRpbWVzIHRvIHRpbWVjaHVuayBhbmQgZnJvbSB0aW1lY2h1bmsgdmlhIFt0aW1lY2h1bmtdIHRvIHNpbmtcclxuICAgICAgICAgICAgcm9vdC5PdXRwdXRFZGdlcy5BZGQobmV3IEVkZ2UoMSwgMCwgcm9vdCwgczEpKTtcclxuICAgICAgICAgICAgcm9vdC5PdXRwdXRFZGdlcy5BZGQobmV3IEVkZ2UoMSwgMCwgcm9vdCwgczIpKTtcclxuICAgICAgICAgICAgczEuSW5wdXRFZGdlcy5BZGQocm9vdC5PdXRwdXRFZGdlc1swXSk7XHJcbiAgICAgICAgICAgIHMyLklucHV0RWRnZXMuQWRkKHJvb3QuT3V0cHV0RWRnZXNbMV0pO1xyXG5cclxuICAgICAgICAgICAgdDEuT3V0cHV0RWRnZXMuQWRkKG5ldyBFZGdlKDEsIDAsIHQxLCB0Y2gpKTtcclxuICAgICAgICAgICAgdDIuT3V0cHV0RWRnZXMuQWRkKG5ldyBFZGdlKDEsIDAsIHQyLCB0Y2gpKTtcclxuICAgICAgICAgICAgdGNoLklucHV0RWRnZXMuQWRkKHQxLk91dHB1dEVkZ2VzWzBdKTtcclxuICAgICAgICAgICAgdGNoLklucHV0RWRnZXMuQWRkKHQxLk91dHB1dEVkZ2VzWzBdKTtcclxuXHJcbiAgICAgICAgICAgIHRjaC5PdXRwdXRFZGdlcy5BZGQobmV3IFRpbWVDaHVuayh0Y2gsIHNpbmspKTtcclxuICAgICAgICAgICAgc2luay5JbnB1dEVkZ2VzLkFkZCh0Y2guT3V0cHV0RWRnZXNbMF0pO1xyXG4gICAgICAgICAgICAvLyBBZGQgcGF0aHMgZnJvbSBzdHVkZW50cyB0byB0aW1lc1xyXG4gICAgICAgICAgICBzMS5PdXRwdXRFZGdlcy5BZGQobmV3IEVkZ2UoMSwgMCwgczEsIHQxKSk7XHJcbiAgICAgICAgICAgIHMxLk91dHB1dEVkZ2VzLkFkZChuZXcgRWRnZSgxLCAwLCBzMSwgdDIpKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFwcGx5IG5ldyBncmFwaFxyXG4gICAgICAgICAgICBmbG93Lk5vZGVzLkFkZFJhbmdlKG5ldyBMaXN0PE5vZGU+KCkgeyByb290LCBzMSwgczIsIHQxLCB0MiwgdGNoLCBzaW5rIH0pOyovXHJcbiAgICAgICAgICAgIC8vIEVuZCBvZiBhbHRlciBmbG93XHJcbiAgICAgICAgICAgIGludFtdIGJyZWFrcyA9IGZsb3cuR2V0UmVzdWx0KCk7XHJcbiAgICAgICAgICAgIGJyZWFrQWZ0ZXJMZXNzb25zU3RhcnQgPSBicmVha3M7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGludGVybmFsIHN0cnVjdCBCcnV0ZUZvcmNlZFN0dWRlbnRcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgaW50IG1pbnV0ZXNGcm9tO1xyXG4gICAgICAgIHB1YmxpYyBVc2VyIHN0dWRlbnQ7XHJcblxyXG4gICAgICAgIHB1YmxpYyBCcnV0ZUZvcmNlZFN0dWRlbnQoaW50IG1pbnV0ZXNGcm9tLCBVc2VyIHN0dWRlbnQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm1pbnV0ZXNGcm9tID0gbWludXRlc0Zyb207XHJcbiAgICAgICAgICAgIHRoaXMuc3R1ZGVudCA9IHN0dWRlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvd1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgRWRnZVxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBpbnQgQ2FwYWNpdHk7XHJcbiAgICAgICAgcHJpdmF0ZSBpbnQgY3VycmVudEZsb3c7XHJcbiAgICAgICAgcHVibGljIE5vZGUgRnJvbTtcclxuICAgICAgICBwdWJsaWMgTm9kZSBUbztcclxuXHJcbiAgICAgICAgcHVibGljIEVkZ2UoaW50IGNhcGFjaXR5LCBpbnQgY3VycmVudEZsb3csIE5vZGUgZnJvbSwgTm9kZSB0bylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIENhcGFjaXR5ID0gY2FwYWNpdHk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEZsb3cgPSBjdXJyZW50RmxvdztcclxuICAgICAgICAgICAgRnJvbSA9IGZyb207XHJcbiAgICAgICAgICAgIFRvID0gdG87XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdmlydHVhbCBpbnQgR2V0Q3VycmVudEZsb3coSUVudW1lcmFibGU8Tm9kZT4gY3VycmVudFBhdGgsIEZsb3cgZmxvdywgc3RyaW5nIGluZm8pXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudEZsb3c7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgdmlydHVhbCB2b2lkIFNldEN1cnJlbnRGbG93KGludCBuZXdWYWx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRGbG93ID0gbmV3VmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93XHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBGbG93XHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIExpc3Q8Tm9kZT4gTm9kZXMgeyBnZXQ7IHByaXZhdGUgc2V0OyB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgVXNlciB0ZWFjaGVyO1xyXG4gICAgICAgIHByaXZhdGUgTGlzdDxVc2VyPiBzdHVkZW50cztcclxuXHJcbiAgICAgICAgLy8gVE9ETzogU3R1ZGVudCBuYW1lIG11c3QgTk9UIGNvbnRhaW4gdGhpcyBjaGFyIC0+IDpcclxuICAgICAgICBwdWJsaWMgRmxvdyhVc2VyIHRlYWNoZXIsIExpc3Q8VXNlcj4gc3R1ZGVudHMpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLnRlYWNoZXIgPSB0ZWFjaGVyO1xyXG4gICAgICAgICAgICB0aGlzLnN0dWRlbnRzID0gc3R1ZGVudHM7XHJcbiAgICAgICAgICAgIHRoaXMuTm9kZXMgPSBuZXcgTGlzdDxOb2RlPigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZvaWQgREVCVUdfQ2xlYXJOb2RlcygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBOb2Rlcy5DbGVhcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxyXG4gICAgICAgIC8vLyBHZXRzIHJlc3VsdCB1c2luZyBmbG93cy4gVGhpcyBtZXRob2Qgd2lsbCBzZXQgc3R1ZGVudCBhc3NpZ25lZCB0aW1lcyBhbmQgcmV0dXJuIGFycmF5IG9mIG1pbnV0ZXMsIHdoZW4gaXMgYnJlYWsgdGltZSBlYWNoIGRheVxyXG4gICAgICAgIC8vLyA8L3N1bW1hcnk+XHJcbiAgICAgICAgLy8vIDxyZXR1cm5zPjwvcmV0dXJucz5cclxuICAgICAgICBwdWJsaWMgaW50W10gR2V0UmVzdWx0KClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludFtdIGJyZWFrcyA9IG5ldyBpbnRbNV07XHJcblxyXG4gICAgICAgICAgICBmb3IgKGludCBkYXkgPSAwOyBkYXkgPCA1OyBkYXkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTG9nLldyaXRlKHN0cmluZy5Gb3JtYXQoXCI9PT09PT09PT09PT09PT09PT09REFZOiB7MH09PT09PT09PT09PT09PVwiLGRheSksIExvZy5TZXZlcml0eS5JbmZvKTtcclxuICAgICAgICAgICAgICAgIEJ1aWxkR3JhcGgoZGF5KTtcclxuICAgICAgICAgICAgICAgIFN0YXJ0KCk7XHJcbiAgICAgICAgICAgICAgICBMb2cuV3JpdGUoXCJEb25lLi4uXCIsIExvZy5TZXZlcml0eS5JbmZvKTtcclxuICAgICAgICAgICAgICAgIHZhciBzdHVkZW50c1RvZGF5ID0gR2V0UmVzdWx0RnJvbUdyYXBoKGRheSk7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbW9yZSB0aGVuIHRocmVlIHN0dWRlbnRzIHRvZGF5OlxyXG4gICAgICAgICAgICAgICAgaWYgKHN0dWRlbnRzVG9kYXkuQ291bnQgPiAzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFNhdmUgZmlyc3QgdGhyZWUgc3R1ZGVudCB0aW1lc1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgMzsgaSsrKSBBcHBseVN0dWRlbnQoc3R1ZGVudHNUb2RheVtpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRGlzYWJsZSBtaW51dGVzIGFuZCByZWNvcmQgYnJlYWsgdGltZVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrc1tkYXldID0gc3R1ZGVudHNUb2RheVsyXS50aW1lU3RhcnQgKyA1MDtcclxuICAgICAgICAgICAgICAgICAgICAvLyBTdGFydCBhZ2FpbiAocmVtb3ZlIGZpcnN0IHR3byBzdHVkZW50cyBhbmQgdGhlaXIgdGltZXMpXHJcbiAgICAgICAgICAgICAgICAgICAgQnVpbGRHcmFwaChkYXksIGJyZWFrc1tkYXldLCBicmVha3NbZGF5XSArIFBsYW4uYnJlYWtBZnRlckxlc3NvbnNMZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIFN0YXJ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHNUb2RheSA9IEdldFJlc3VsdEZyb21HcmFwaChkYXkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrc1tkYXldID0gaW50Lk1heFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFwcGx5IGFsbCBzdHVkZW50c1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoQXNzaWdubWVudFByZXZpZXcgcmVzdWx0IGluIHN0dWRlbnRzVG9kYXkpIEFwcGx5U3R1ZGVudChyZXN1bHQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBMb2cuV3JpdGUoXCJCcmVhazogXCIgKyBTdHJpbmcuSm9pbjxpbnQ+KFwiLCBcIiwgYnJlYWtzKSwgTG9nLlNldmVyaXR5LkluZm8pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGJyZWFrcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBCdWlsZEdyYXBoKGludCBkYXksIGludCBiYW5uZWRUaW1lc3BhbkZyb20gPSAtMSwgaW50IGJhbm5lZFRpbWVzcGFuVG8gPSAtMSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIE5vZGVzLkNsZWFyKCk7XHJcbiAgICAgICAgICAgIC8vIEFkZCByb290IG5vZGVcclxuICAgICAgICAgICAgTm9kZSByb290ID0gbmV3IE5vZGUoXCJJbnB1dFwiLCAtMSwgTm9kZS5Ob2RlVHlwZS5JbnB1dCk7XHJcbiAgICAgICAgICAgIE5vZGVzLkFkZChyb290KTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBhbGwgc3R1ZGVudHMgbm9kZXNcclxuICAgICAgICAgICAgZm9yZWFjaCAoVXNlciBzdHVkZW50IGluIHN0dWRlbnRzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc3R1ZGVudC5hc3NpZ25lZCB8fCAhc3R1ZGVudC5kYXlzQXZhaWxhYmxlW2RheV0pXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogRXJyb3Igd2hlbiBtdWx0aXBsZSBzdHVkZW50cyB3aXRoIHNhbWUgbmFtZVxyXG4gICAgICAgICAgICAgICAgTm9kZSBzdHVkZW50Tm9kZSA9IG5ldyBOb2RlKFwiU3R1ZGVudDpcIiArIHN0dWRlbnQubmFtZSwgLTEsIE5vZGUuTm9kZVR5cGUuRGVmYXVsdCk7XHJcbiAgICAgICAgICAgICAgICBBZGROb2RlQWZ0ZXIoXCJJbnB1dFwiLCBzdHVkZW50Tm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFByZXBhcmUgdGltZSBjaHVuayBub2RlXHJcbiAgICAgICAgICAgIE5vZGUgdGltZUNodW5rID0gbmV3IE5vZGUoXCJUaW1lQ2h1bmtcIiwgLTEsIE5vZGUuTm9kZVR5cGUuRGVmYXVsdCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgb2NjdXBpZWRUaW1lc1RvZGF5ID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KShzdHVkZW50ID0+IHN0dWRlbnQuYXNzaWduZWREYXkgPT0gZGF5KSkuU2VsZWN0PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGludD4pKHN0dWRlbnQgPT4gc3R1ZGVudC5hc3NpZ25lZE1pbnV0ZXMpKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBhbGwgdGltZXMgbm9kZXNcclxuICAgICAgICAgICAgZm9yIChpbnQgdGltZSA9IDA7IHRpbWUgPCAyNCAqIDYwOyB0aW1lICs9IDUpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSB0aW1lIGlzIGJhbm5lZCBvciBzb21lb25lIGFscmVhZHkgcG9zaXRpb25lZCB1c2VkIHRoZSB0aW1lLCBza2lwIHRvIG5leHQgdGltZVxyXG4gICAgICAgICAgICAgICAgaWYgKCh0aW1lID49IGJhbm5lZFRpbWVzcGFuRnJvbSAmJiB0aW1lIDw9IGJhbm5lZFRpbWVzcGFuVG8pIHx8XHJcbiAgICAgICAgICAgICAgICAgICAgb2NjdXBpZWRUaW1lc1RvZGF5LldoZXJlKChnbG9iYWw6OlN5c3RlbS5GdW5jPGludCwgYm9vbD4pKG9jY1RpbWUgPT4gTWF0aC5BYnMob2NjVGltZSAtIHRpbWUpIDwgNTApKS5Db3VudCgpID4gMClcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGVhY2hlci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldIDw9IHRpbWUgJiYgdGVhY2hlci5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIFBsYW4ubGVzc29uTGVuZ3RoID49IHRpbWUpXHJcbiAgICAgICAgICAgICAgICB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHVkZW50c0F0VGhpc1RpbWUgPSAvKiBTdHVkZW50cyB0aGF0IGhhdmUgdGltZSByaWdodCBub3cgKi8gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KShzdHVkZW50ID0+ICFzdHVkZW50LmFzc2lnbmVkICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50LmRheXNBdmFpbGFibGVbZGF5XSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldIDw9IHRpbWUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnQubWludXRlc1RvQXZhaWxhYmxlW2RheV0gLSBQbGFuLmxlc3Nvbkxlbmd0aCA+PSB0aW1lKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIE5vZGUgdGltZU5vZGUgPSBuZXcgTm9kZShcIlRpbWU6XCIgKyB0aW1lLCB0aW1lLCBOb2RlLk5vZGVUeXBlLkRlZmF1bHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcmVhY2ggKFVzZXIgc3R1ZGVudCBpbiBzdHVkZW50c0F0VGhpc1RpbWUpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBBZGROb2RlQWZ0ZXIoXCJTdHVkZW50OlwiICsgc3R1ZGVudC5uYW1lLCB0aW1lTm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIEFkZE5vZGVBZnRlcihcIlRpbWU6XCIgKyB0aW1lLCB0aW1lQ2h1bmspO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBDb25uZWN0IFRpbWUgQ2h1bmsgd2l0aCBvdXRwdXRcclxuICAgICAgICAgICAgTm9kZSBvdXRwdXQgPSBuZXcgTm9kZShcIk91dHB1dFwiLCAtMSwgTm9kZS5Ob2RlVHlwZS5PdXRwdXQpO1xyXG4gICAgICAgICAgICBBZGROb2RlQWZ0ZXIoXCJUaW1lQ2h1bmtcIiwgb3V0cHV0KTtcclxuXHJcbiAgICAgICAgICAgIC8vIENoYW5nZSBlZGdlIGJldHdlZW4gVGltZUNodW5rKE5vZGUpIGFuZCBPdXRwdXQgdG8gVGltZUNodW5rKEVkZ2UpXHJcbiAgICAgICAgICAgIFRpbWVDaHVuayB0aW1lQ2h1bmtFZGdlID0gbmV3IFRpbWVDaHVuayh0aW1lQ2h1bmssIG91dHB1dCk7XHJcbiAgICAgICAgICAgIHRpbWVDaHVuay5PdXRwdXRFZGdlcy5DbGVhcigpO1xyXG4gICAgICAgICAgICB0aW1lQ2h1bmsuT3V0cHV0RWRnZXMuQWRkKHRpbWVDaHVua0VkZ2UpO1xyXG4gICAgICAgICAgICBvdXRwdXQuSW5wdXRFZGdlcy5DbGVhcigpO1xyXG4gICAgICAgICAgICBvdXRwdXQuSW5wdXRFZGdlcy5BZGQodGltZUNodW5rRWRnZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgQWRkTm9kZUFmdGVyKHN0cmluZyBpZGVudGlmaWVyLCBOb2RlIG5ld05vZGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBmb3JlYWNoIChOb2RlIG5vZGUgaW4gTm9kZXMpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmIChub2RlLklkZW50aWZpZXIgPT0gaWRlbnRpZmllcilcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBFZGdlIG5ld0VkZ2UgPSBuZXcgRWRnZSgxLCAwLCBub2RlLCBuZXdOb2RlKTtcclxuICAgICAgICAgICAgICAgICAgICBub2RlLk91dHB1dEVkZ2VzLkFkZChuZXdFZGdlKTtcclxuICAgICAgICAgICAgICAgICAgICBuZXdOb2RlLklucHV0RWRnZXMuQWRkKG5ld0VkZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghTm9kZXMuQ29udGFpbnMobmV3Tm9kZSkpXHJcbiAgICAgICAgICAgICAgICBOb2Rlcy5BZGQobmV3Tm9kZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgU3RhcnQoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gV2hpbGUgd2UgYXJlIGNyZWF0aW5nIG5ldyBmbG93LCBrZWVwIGRvaW5nIGl0XHJcbiAgICAgICAgICAgIHdoaWxlIChDcmVhdGVOZXdGbG93KCkpIDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJldHVybiB2YWx1ZTogZGlkIHdlIGNyZWF0ZSBuZXcgZmxvdz9cclxuICAgICAgICBwcml2YXRlIGJvb2wgT0xEX0NyZWF0ZU5ld0Zsb3coKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gTGV0J3MgY3JlYXRlIGRpY3Rpb25hcnkgb2YgTm9kZSA6IFNvdXJjZU5vZGVcclxuICAgICAgICAgICAgLy8gICstLS0tKy0tLS0rLS0tLSstLS0tLSstLS0tLStcclxuICAgICAgICAgICAgLy8gIHwgQTEgfCBBMiB8IEIxIHwgVENIIHwgT1VUIHwgXHJcbiAgICAgICAgICAgIC8vICArLS0tLSstLS0tKy0tLS0rLS0tLS0rLS0tLS0rXHJcbiAgICAgICAgICAgIC8vICB8IEkgIHwgSSAgfCBBMSB8IEIxICB8IFRDSCB8XHJcbiAgICAgICAgICAgIC8vICArLS0tLSstLS0tKy0tLS0rLS0tLS0rLS0tLS0rXHJcblxyXG4gICAgICAgICAgICBEaWN0aW9uYXJ5PE5vZGUsIE5vZGU+IEZsb3dQYXRoID0gbmV3IERpY3Rpb25hcnk8Tm9kZSwgTm9kZT4oTm9kZXMuQ291bnQpO1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMTsgaSA8IE5vZGVzLkNvdW50OyBpKyspIEZsb3dQYXRoLkFkZChOb2Rlc1tpXSwgbnVsbCk7IC8vIEFkZCBhbGwgbm9kZXMgaW50byBGbG93UGF0aCAhZXhjZXB0IGZvciByb290IG5vZGVcclxuXHJcbiAgICAgICAgICAgIFF1ZXVlPE5vZGU+IE5vZGVzVG9Qcm9jZXNzID0gbmV3IFF1ZXVlPE5vZGU+KCk7XHJcbiAgICAgICAgICAgIE5vZGVzVG9Qcm9jZXNzLkVucXVldWUoTm9kZXNbMF0pOyAvLyBNYXJrIHJvb3Qgbm9kZSBhcyB0by1wcm9jZXNzXHJcblxyXG4gICAgICAgICAgICBIYXNoU2V0PE5vZGU+IEFscmVhZHlBZGRlZE5vZGVzID0gbmV3IEhhc2hTZXQ8Tm9kZT4oKTtcclxuICAgICAgICAgICAgQWxyZWFkeUFkZGVkTm9kZXMuQWRkKE5vZGVzWzBdKTtcclxuICAgICAgICAgICAgd2hpbGUgKE5vZGVzVG9Qcm9jZXNzLkNvdW50ID4gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLy8gR2V0IGFsbCBub2RlcyB0aGF0IHN0aWxsIGhhdmUgYXZhaWFibGUgZmxvdyBzcGFjZSBpbiB0aGVtIGFuZCBhcmVuJ3Qgb2NjdXBpZWQgKGluIEZsb3dQYXRoKVxyXG4gICAgICAgICAgICAgICAgTm9kZSBub2RlID0gTm9kZXNUb1Byb2Nlc3MuRGVxdWV1ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIE5vZGVzIHRoYXQgYXJlIGFjY2Vzc2FibGUgZnJvbSB0aGlzIG5vZGVcclxuICAgICAgICAgICAgICAgIExpc3Q8Tm9kZT4gYXZhaWFibGVOb2RlcyA9IG5ldyBMaXN0PE5vZGU+KG5vZGUuT3V0cHV0RWRnZXMuQ291bnQgKyBub2RlLklucHV0RWRnZXMuQ291bnQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGJvb2wgZG9JbnB1dEVkZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJvb2wgYXJlSW5wdXRFZGdlc0ZvcmJpZGRlbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgTGlzdDxOb2RlPiByZW5kZXJlZFBhdGggPSBSZW5kZXJQYXRoKFN5c3RlbS5MaW5xLkVudW1lcmFibGUuRmlyc3Q8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGU+KE5vZGVzKSwgbm9kZSwgRmxvd1BhdGgpO1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoRWRnZSBvdXRwdXRFZGdlIGluIG5vZGUuT3V0cHV0RWRnZXMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gS2R5eiBqZHUgZG9wcmVkdSwgbXVzaW0gemtvbnRyb2xvdmF0LCBqZXN0bGkgdGVuaGxlIHRpbWVOb2RlIG5lbmkgdiByb3ptZXppIDUwIG1pbnV0IG9kIG5lY2VobywgY2ltIGpzZW0gcHJvc2VsXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG91dHB1dEVkZ2UuVG8uVmFsdWUgIT0gLTEgLyogSWYgdGFyZ2V0IG5vZGUgaXMgVGltZU5vZGUgKi8gJiZcclxuU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZT4oICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyZWRQYXRoLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLCBib29sPikobiA9PiBuLlZhbHVlICE9IC0xICYmIE1hdGguQWJzKG91dHB1dEVkZ2UuVG8uVmFsdWUgLSBuLlZhbHVlKSA8IFBsYW4ubGVzc29uTGVuZ3RoKSkuQ291bnQoKSA+IDAgLyogQW5kIGNvdW50IG9mIG5vZGVzIHRoYXQgSSBwYXNzZWQgdGhydSBhbmQgYXJlIDwgNTAgbWludHVlcyBhd2F5IGlzID4gMCAqLylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIExvZy5Xcml0ZShcIkkndmUgc2tpcHBlZCBvdXRwdXRFZGdlIHdpdGggW3RvTm9kZV06IFwiICsgb3V0cHV0RWRnZS5Uby5JZGVudGlmaWVyLCBMb2cuU2V2ZXJpdHkuQ3JpdGljYWwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGludCBmbG93ID0gb3V0cHV0RWRnZS5HZXRDdXJyZW50RmxvdyhyZW5kZXJlZFBhdGgsIHRoaXMsIFwiT3V0cHV0RWRnZXNcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZsb3cgPiAxKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmVJbnB1dEVkZ2VzRm9yYmlkZGVuID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmxvdyA9PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWFibGVOb2Rlcy5BZGQob3V0cHV0RWRnZS5Ubyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvSW5wdXRFZGdlcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChkb0lucHV0RWRnZXMgJiYgIWFyZUlucHV0RWRnZXNGb3JiaWRkZW4pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yZWFjaCAoRWRnZSBpbnB1dEVkZ2UgaW4gbm9kZS5JbnB1dEVkZ2VzKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBwb3NzaWJsZSBub2RlIGlzIHdpdGhpbiA1MC1taW50dWUgcmFuZ2Ugd2l0aGluIGFub3RoZXIgbm9kZSBpbiBwYXRoLCBza2lwIHRoaXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgLyppZiAoaW5wdXRFZGdlLkZyb20uVmFsdWUgIT0gLTEgJiYgcmVuZGVyZWRQYXRoLldoZXJlKG4gPT4gbi5WYWx1ZSAhPSAtMSAmJiBNYXRoLkFicyhuLlZhbHVlIC0gaW5wdXRFZGdlLkZyb20uVmFsdWUpIDwgUGxhbi5sZXNzb25MZW5ndGgpLkNvdW50KCkgPiAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7Ki8gLy8gVG9obGUgbmljIG5lcmVzaVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUkVTRU5JOiBUb2hsZSBidWR1IHByb2NoYXpldCwgSkVOT00ga2R5eiBuZW5hamR1IHphZG5vdSBjZXN0dSBwb21vY2kgT3V0cHV0RWRnZSAvL1RPRE86IE1vem5lIG5lZnVua2NuaSBwcm8gbmVjbz9cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQnVkdSBobGVkYXQgY2VzdHUgSkVOT00gbWV6aSBocmFuYW1pIGdyYWZ1LCBkbyBrdGVyeWNoIE1VWkUgdGVuIHN0dWRlbnQsIGt0ZXJ5IG1hIGNlc3R1LCBrdGVyb3UgbXUga3JhZHU7IGppdC5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNlbSBzZSBkb3N0YW51IGplbm9tIHYgcHJpcGFkZSwgemUgdnNlY2hueSBPdXRwdXROb2R5IHogVGltZUNodW5rdShOb2RlKSBqc291IG9kbWl0bnV0eSAtPiBbbm9kZV0gamUgdnpkeSBUaW1lQ2h1bmtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChub2RlLklkZW50aWZpZXIgIT0gXCJUaW1lQ2h1bmtcIilcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTG9nLldyaXRlKHN0cmluZy5Gb3JtYXQoXCIhISEgTk9ERSBJU04nVCBUSU1FIENIVU5LICEhISBcXFwiezB9XFxcIiAoezF9KVwiLG5vZGUuSWRlbnRpZmllcixub2RlLlZhbHVlKSwgTG9nLlNldmVyaXR5LkNyaXRpY2FsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTmFqZHUgc2kgc3R1ZGVudGEsIGt0ZXJ5IGhvIGJsb2t1amUgYSBuYWpkdSBtdSBqaW5vdSBjZXN0dS5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGVuaGxlIG5vdnlTdHVkZW50IHNpIHZlem1lIGNlc3R1IHN0YXJlaG8gc3R1ZGVudGEgKF5eKVxyXG5cclxuXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5wdXRFZGdlIGlzIFRpbWVDaHVuaylcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTG9nLldyaXRlKFwiSSBmb3VuZCBpbnB1dCBlZGdlIHRoYXQgd2FzIFRpbWUgQ2h1bms7IGZyb20gPSBcIiArIGlucHV0RWRnZS5Uby5JZGVudGlmaWVyLCBMb2cuU2V2ZXJpdHkuV2FybmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdoeT9cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbmRlcmVkUGF0aC5Db3VudCA+PSAyICYmIGlucHV0RWRnZS5Gcm9tID09IHJlbmRlcmVkUGF0aFtyZW5kZXJlZFBhdGguQ291bnQgLSAyXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaW50IGZsb3cgPSBpbnB1dEVkZ2UuR2V0Q3VycmVudEZsb3cocmVuZGVyZWRQYXRoLCB0aGlzLCBcIklucHV0RWRnZXNcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmbG93ID09IDEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWlhYmxlTm9kZXMuQWRkKGlucHV0RWRnZS5Gcm9tKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIExvZy5Xcml0ZShcIkkganVzdCB1c2VkIGJhY2tmbG93LiBIZXJlJ3MgZnVsbCBwYXRoOiBcIiArIFN0cmluZy5Kb2luKFwiICwgXCIsIFN5c3RlbS5MaW5xLkVudW1lcmFibGUuU2VsZWN0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLHN0cmluZz4ocmVuZGVyZWRQYXRoLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLCBzdHJpbmc+KShuID0+IHN0cmluZy5Gb3JtYXQoXCJcXFwiezB9XFxcIih7MX0pXCIsbi5JZGVudGlmaWVyLG4uVmFsdWUpKSkpICsgXCIuIFRoZSBuZXcgbm9kZSBpcyBcXFwiXCIgKyBpbnB1dEVkZ2UuRnJvbS5JZGVudGlmaWVyICsgXCJcXFwiKFwiICsgaW5wdXRFZGdlLkZyb20uVmFsdWUgKyBcIilcIiwgTG9nLlNldmVyaXR5LkNyaXRpY2FsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEZpbGwgYWxsIG5vZGVzIHRoYXQgYXJlIGFjY2Vzc2libGUgZnJvbSB0aGlzIG5vZGVcclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE5vZGUgbm9kZVRvR29UaHJvdWdoIGluIGF2YWlhYmxlTm9kZXMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKEFscmVhZHlBZGRlZE5vZGVzLkNvbnRhaW5zKG5vZGVUb0dvVGhyb3VnaCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBBbHJlYWR5QWRkZWROb2Rlcy5BZGQobm9kZVRvR29UaHJvdWdoKTtcclxuICAgICAgICAgICAgICAgICAgICBGbG93UGF0aFtub2RlVG9Hb1Rocm91Z2hdID0gbm9kZTtcclxuICAgICAgICAgICAgICAgICAgICBOb2Rlc1RvUHJvY2Vzcy5FbnF1ZXVlKG5vZGVUb0dvVGhyb3VnaCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIE5vdywgSSAocHJvYmFibHkpIGhhdmUgZmxvd1xyXG4gICAgICAgICAgICBMb2cuV3JpdGUodGhpcy5Ub1N0cmluZygpLCBMb2cuU2V2ZXJpdHkuSW5mbyk7XHJcbiAgICAgICAgICAgIERFQlVHX1dyaXRlRmxvd1BhdGgoRmxvd1BhdGgpO1xyXG4gICAgICAgICAgICB2YXIgVGltZUNodW5rID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZT4oRmxvd1BhdGguS2V5cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSwgYm9vbD4pKHggPT4geC5JZGVudGlmaWVyID09IFwiVGltZUNodW5rXCIpKS5TaW5nbGVPckRlZmF1bHQoKTtcclxuICAgICAgICAgICAgaWYgKFRpbWVDaHVuayA9PSBudWxsIHx8IEZsb3dQYXRoW1RpbWVDaHVua10gPT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTG9nLldyaXRlKFwiTm8gZmxvd1wiLCBMb2cuU2V2ZXJpdHkuSW5mbyk7XHJcbiAgICAgICAgICAgICAgICAvLyBObyBmbG93XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBMb2cuV3JpdGUoXCJBcHBseWluZyBmbG93XCIsIExvZy5TZXZlcml0eS5JbmZvKTtcclxuICAgICAgICAgICAgICAgIEFwcGx5RmxvdyhTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkZpcnN0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPihOb2RlcyksIFRpbWVDaHVuaywgRmxvd1BhdGgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qLy8gRmlyc3Qgb2YgYWxsLCB3ZSBoYXZlIHRvIGNyZWF0ZSB0aGUgZGljdGlvbmFyeSwgc28gd2Uga25vdywgd2hhdCB0aGUgcGF0aCBpc1xyXG4gICAgICAgICAgICBEaWN0aW9uYXJ5PE5vZGUsIE5vZGU+IEZsb3dQYXRoID0gbmV3IERpY3Rpb25hcnk8Tm9kZSwgTm9kZT4oKTtcclxuICAgICAgICAgICAgLy8gUG9wdWxhdGUgdGhlIGRpY3Rpb25hcnkgd2l0aCBub2Rlc1xyXG4gICAgICAgICAgICBmb3JlYWNoIChOb2RlIG5vZGUgaW4gTm9kZXMpIEZsb3dQYXRoLkFkZChub2RlLCBudWxsKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEhlcmUsIHdlIGNyZWF0ZSBRdWV1ZSwgdGhhdCBob2xkcyBub2RlcywgdGhhdCB3ZSB3aWxsIHdhbnQgdG8gd29yayB3aXRoXHJcbiAgICAgICAgICAgIC8vIFBsdXMgbGlzdCBvZiBub2RlcyB3aGljaCB3ZXJlIGFscmVhZHkgYWRkZWQgdG8gUXVldWUsIHNvIHdlIGRvbid0IHByb2Nlc3Mgb25lIG5vZGUgbXVsdGlwbGUgdGltZXNcclxuICAgICAgICAgICAgUXVldWU8Tm9kZT4gbm9kZXNUb1Byb2Nlc3MgPSBuZXcgUXVldWU8Tm9kZT4oKTtcclxuICAgICAgICAgICAgLy8gQW5kIGxldCdzIGVucXVldWUgcm9vdCBub2RlXHJcbiAgICAgICAgICAgIG5vZGVzVG9Qcm9jZXNzLkVucXVldWUoTm9kZXNbMF0pO1xyXG4gICAgICAgICAgICAvLyBIZXJlJ3MgdGhlIGxpc3Qgb2YgYWRkZWQgbm9kZXNcclxuICAgICAgICAgICAgSGFzaFNldDxOb2RlPiBhbHJlYWR5QWRkZWROb2RlcyA9IG5ldyBIYXNoU2V0PE5vZGU+KCk7XHJcbiAgICAgICAgICAgIC8vIEFuZCBhZGQgdGhlIHJvb3Qgbm9kZVxyXG4gICAgICAgICAgICBhbHJlYWR5QWRkZWROb2Rlcy5BZGQoTm9kZXNbMF0pO1xyXG5cclxuICAgICAgICAgICAgLy8gTm93IHdlIGJ1aWxkIHRoZSBmbG93OiBcclxuXHJcbiAgICAgICAgICAgIC8vIFdoaWxlIHdlIGhhdmUgc29tZXRoaW5nIHRvIHByb2Nlc3MgaW4gcXVldWUsIHNlbGVjdCB0aGUgbm9kZS4uLlxyXG4gICAgICAgICAgICB3aGlsZShub2Rlc1RvUHJvY2Vzcy5Db3VudCA+IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIE5vZGUgbm9kZVRvUHJvY2VzcyA9IG5vZGVzVG9Qcm9jZXNzLkRlcXVldWUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBUaGUgcGF0aHMgdXNlZCBpbiBlZGdlLkdldEN1cnJlbnRGbG93IGRvIE5PVCBjb250YWluIHRoZSBjdXJyZW50IG5vZGUgLT4gcHJvYmxlbT9cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLy8gRmlyc3Qgb2YgYWxsLCBzYXZlIGN1cnJlbnQgcGF0aCBmcm9tIHRoaXMgbm9kZSB0byBpbnB1dCwgaW52ZXJ0ZWQuIFRoaXMgaXMgdXNlZCB0byBjYWxjdWxhdGUgZmxvdyB0aHJvdWdoIHRpbWUgY2h1bmsgZWRnZXNcclxuICAgICAgICAgICAgICAgIExpc3Q8Tm9kZT4gcGF0aCA9IFJlbmRlclBhdGgoTm9kZXNbMF0sIG5vZGVUb1Byb2Nlc3MsIEZsb3dQYXRoKTtcclxuICAgICAgICAgICAgICAgIC8vIFdoYXQgd2UgZG8gaGVyZT8gR2V0IGNvbGxlY3Rpb24gb2YgZWRnZXMgdGhhdCBnb2VzIGZyb20gdGhpcyBub2RlXHJcbiAgICAgICAgICAgICAgICB2YXIgZWRnZXNGcm9tVGhpc05vZGUgPSBub2RlVG9Qcm9jZXNzLk91dHB1dEVkZ2VzLldoZXJlKGVkZ2UgPT4gRmxvd1BhdGhbZWRnZS5Ub10gPT0gbnVsbCAmJiBlZGdlLkdldEN1cnJlbnRGbG93KHBhdGgsIHRoaXMsIFwiR2V0dGluZyBvdXRwdXQgZWRnZXNcIikgPT0gMCk7XHJcbiAgICAgICAgICAgICAgICAvLyBOb3csIHdlIGdldCBlZGdlcyBmcm9tIHRoaXMgbm9kZSB0byBpdCdzIGlucHV0cywgYnV0IG5vdCB0aGUgaW5wdXRzIHRoYXQgd2UgYWxyZWFkeSB3ZW50IHRocm91Z2guIFxyXG4gICAgICAgICAgICAgICAgdmFyIGVkZ2VzVG9UaGlzTm9kZSA9IG5vZGVUb1Byb2Nlc3MuSW5wdXRFZGdlcy5XaGVyZShlZGdlID0+IEZsb3dQYXRoW2VkZ2UuRnJvbV0gPT0gbnVsbCAmJiAhcGF0aC5Db250YWlucyhlZGdlLkZyb20pICYmIGVkZ2UuR2V0Q3VycmVudEZsb3cocGF0aCwgdGhpcywgXCJHZXR0aW5nIGlucHV0IGVkZ2VzXCIpID09IDEpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFkZCB0aGUgbm9kZXMgd2UgZ290IGludG8gRmxvd1BhdGhcclxuICAgICAgICAgICAgICAgIGVkZ2VzRnJvbVRoaXNOb2RlLkZvckVhY2goZWRnZSA9PiBGbG93UGF0aFtlZGdlLlRvXSA9IG5vZGVUb1Byb2Nlc3MpO1xyXG4gICAgICAgICAgICAgICAgZWRnZXNUb1RoaXNOb2RlLkZvckVhY2goZWRnZSA9PiBGbG93UGF0aFtlZGdlLkZyb21dID0gbm9kZVRvUHJvY2Vzcyk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQWRkIHRoZXNlIG5vZGVzIHRvIHRvLXByb2Nlc3MgbGlzdFxyXG4gICAgICAgICAgICAgICAgZWRnZXNGcm9tVGhpc05vZGUuRm9yRWFjaChlZGdlID0+IG5vZGVzVG9Qcm9jZXNzLkVucXVldWUoZWRnZS5UbykpO1xyXG4gICAgICAgICAgICAgICAgZWRnZXNGcm9tVGhpc05vZGUuRm9yRWFjaChlZGdlID0+IG5vZGVzVG9Qcm9jZXNzLkVucXVldWUoZWRnZS5Gcm9tKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIE5vdywgd2UgbWF5IGhhdmUgdGhlIGZsb3dcclxuICAgICAgICAgICAgLy8gSnVzdCBjaGVjayB0aGUgb3V0cHV0XHJcbiAgICAgICAgICAgIE5vZGUgb3V0cHV0ID0gTm9kZXMuV2hlcmUobm9kZSA9PiBub2RlLklkZW50aWZpZXIgPT0gXCJPdXRwdXRcIikuU2luZ2xlKCk7XHJcbiAgICAgICAgICAgIC8vIElmIHRoZSBvdXRwdXQgaGFzIHNvbWV0aGluZyBpbiBGbG93UGF0aCwgd2UgaGF2ZSBmbG93IVxyXG4gICAgICAgICAgICBpZihGbG93UGF0aFtvdXRwdXRdICE9IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8vIEFwcGx5IGZsb3dcclxuICAgICAgICAgICAgICAgIEFwcGx5RmxvdyhOb2Rlcy5GaXJzdCgpLCBvdXRwdXQsIEZsb3dQYXRoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9Ki9cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgYm9vbCBDcmVhdGVOZXdGbG93KClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIEZpcnN0IG9mIGFsbCwgbGV0J3MgY3JlYXRlIGEgZGljdGlvbmFyeSwgd2hlbiB3ZSdsbCBzdG9yZSBjdXJyZW50bHkgY2hvc2VuIHBhdGhcclxuICAgICAgICAgICAgRGljdGlvbmFyeTxOb2RlLCBOb2RlPiBOb2Rlc1BhdGggPSBuZXcgRGljdGlvbmFyeTxOb2RlLCBOb2RlPigpO1xyXG4gICAgICAgICAgICAvLyBBZGQga2V5cyBhbmQgbnVsbFxyXG4gICAgICAgICAgICBOb2Rlcy5Gb3JFYWNoKChnbG9iYWw6OlN5c3RlbS5BY3Rpb248Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGU+KShub2RlID0+IE5vZGVzUGF0aC5BZGQobm9kZSwgbnVsbCkpKTtcclxuXHJcbiAgICAgICAgICAgIC8vIExldCdzIHN0YXJ0IHByb2Nlc3Npbmcgbm9kZXNcclxuICAgICAgICAgICAgUXVldWU8Tm9kZT4gbm9kZXNUb1Byb2Nlc3MgPSBuZXcgUXVldWU8Tm9kZT4oKTtcclxuICAgICAgICAgICAgSGFzaFNldDxOb2RlPiBhbHJlYWR5UHJvY2Vzc2VkTm9kZXMgPSBuZXcgSGFzaFNldDxOb2RlPigpO1xyXG4gICAgICAgICAgICBub2Rlc1RvUHJvY2Vzcy5FbnF1ZXVlKE5vZGVzWzBdKTtcclxuICAgICAgICAgICAgYWxyZWFkeVByb2Nlc3NlZE5vZGVzLkFkZChOb2Rlc1swXSk7XHJcblxyXG4gICAgICAgICAgICAvLyBXaGlsZSB0aGVyZSdzIHNvbWV0aGluZyB0byBwcm9jZXNzLCBwcm9jZXNzIGl0XHJcbiAgICAgICAgICAgIHdoaWxlIChub2Rlc1RvUHJvY2Vzcy5Db3VudCA+IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIC8vIFN0YXJ0IGJ5IGdldHRpbmcgbm9kZSBmcm9tIHRoZSBxdWV1ZVxyXG4gICAgICAgICAgICAgICAgTm9kZSBub2RlID0gbm9kZXNUb1Byb2Nlc3MuRGVxdWV1ZSgpO1xyXG4gICAgICAgICAgICAgICAgLy8gQW5kIGdldCBjdXJyZW50IHBhdGhcclxuICAgICAgICAgICAgICAgIExpc3Q8Tm9kZT4gcGF0aCA9IFJlbmRlclBhdGgoTm9kZXNbMF0sIG5vZGUsIE5vZGVzUGF0aCk7XHJcbiAgICAgICAgICAgICAgICBMb2cuV3JpdGUoU3RyaW5nLkpvaW4oXCIgLT4gXCIsIFN5c3RlbS5MaW5xLkVudW1lcmFibGUuU2VsZWN0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLHN0cmluZz4ocGF0aCwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSwgc3RyaW5nPikoeCA9PiB4LklkZW50aWZpZXIpKSksIExvZy5TZXZlcml0eS5JbmZvKTsgLy8gRGVidWc6IHdyaXRlIGN1cnJlbnRseSByZW5kZXJlZCBwYXRoXHJcbiAgICAgICAgICAgICAgICAvLyBOb3cgd2UgbmVlZCB0byBnZXQgbmV4dCBub2RlcyBmcm9tIHRoaXMgbm9kZS4uLlxyXG4gICAgICAgICAgICAgICAgdmFyIG5leHROb2RlcyA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2U+KG5vZGUuT3V0cHV0RWRnZXMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2UsIGJvb2w+KShlZGdlID0+IGVkZ2UuR2V0Q3VycmVudEZsb3cocGF0aCwgdGhpcywgXCJHZXR0aW5nIG91dHB1dCBub2Rlc1wiKSA9PSAwKSk7XHJcbiAgICAgICAgICAgICAgICAvLyBBbmQgZ2V0IHByZXZpb3VzIG5vZGVzXHJcbiAgICAgICAgICAgICAgICB2YXIgcHJldmlvdXNOb2RlcyA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2U+KG5vZGUuSW5wdXRFZGdlcywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZSwgYm9vbD4pKGVkZ2UgPT4gZWRnZS5HZXRDdXJyZW50RmxvdyhwYXRoLCB0aGlzLCBcIkdldHRpbmcgaW5wdXQgbm9kZXNcIikgPT0gMSkpO1xyXG4gICAgICAgICAgICAgICAgLy8gRmlsdGVyIHRoZSBub2RlcyB0byBvbmx5IGFsbG93IHRob3NlIHRoYXQgYXJlIG5vdCBpbiBhbHJlYWR5UHJvY2Vzc2VkTm9kZXNcclxuICAgICAgICAgICAgICAgIG5leHROb2RlcyA9IG5leHROb2Rlcy5XaGVyZSgoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZSwgYm9vbD4pKG5ld05vZGUgPT4gIWFscmVhZHlQcm9jZXNzZWROb2Rlcy5Db250YWlucyhuZXdOb2RlLlRvKSkpO1xyXG4gICAgICAgICAgICAgICAgcHJldmlvdXNOb2RlcyA9IHByZXZpb3VzTm9kZXMuV2hlcmUoKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2UsIGJvb2w+KShuZXdOb2RlID0+ICFhbHJlYWR5UHJvY2Vzc2VkTm9kZXMuQ29udGFpbnMobmV3Tm9kZS5Gcm9tKSkpO1xyXG4gICAgICAgICAgICAgICAgLy8gQWRkIGFsbCB0aGVzZSBub2RlcyB0byBxdWV1ZSwgbGlzdCBvZiBwcm9jZXNzZWQgbm9kZXMgYW5kIHRoZSBkaWN0aW9uYXJ5XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChOb2RlIG5ld05vZGUgaW4gbmV4dE5vZGVzLlNlbGVjdDxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZT4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2UsIGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPikoZWRnZSA9PiBlZGdlLlRvKSkuVW5pb24ocHJldmlvdXNOb2Rlcy5TZWxlY3Q8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGU+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlLCBnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZT4pKGVkZ2UgPT4gZWRnZS5Gcm9tKSkpKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVzVG9Qcm9jZXNzLkVucXVldWUobmV3Tm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxyZWFkeVByb2Nlc3NlZE5vZGVzLkFkZChuZXdOb2RlKTtcclxuICAgICAgICAgICAgICAgICAgICBOb2Rlc1BhdGhbbmV3Tm9kZV0gPSBub2RlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRyeVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIExvZy5Xcml0ZShub2Rlc1RvUHJvY2Vzcy5QZWVrKCksIExvZy5TZXZlcml0eS5JbmZvKTtcclxuICAgICAgICAgICAgICAgICAgICBMb2cuV3JpdGUoTm9kZXNQYXRoW25vZGVzVG9Qcm9jZXNzLlBlZWsoKV0gPT0gbnVsbCwgTG9nLlNldmVyaXR5LkluZm8pO1xyXG4gICAgICAgICAgICAgICAgICAgIExvZy5Xcml0ZShnbG9iYWw6OkJyaWRnZS5TY3JpcHQuVG9UZW1wKFwia2V5MVwiLE5vZGVzUGF0aFtub2Rlc1RvUHJvY2Vzcy5QZWVrKCldKSE9bnVsbD9nbG9iYWw6OkJyaWRnZS5TY3JpcHQuRnJvbVRlbXA8Tm9kZT4oXCJrZXkxXCIpLklkZW50aWZpZXI6KHN0cmluZyludWxsLCBMb2cuU2V2ZXJpdHkuSW5mbyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjYXRjaCB7IH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgTG9nLldyaXRlKHRoaXMuVG9TdHJpbmcoKSwgTG9nLlNldmVyaXR5LkluZm8pO1xyXG4gICAgICAgICAgICBERUJVR19Xcml0ZUZsb3dQYXRoKE5vZGVzUGF0aCk7XHJcbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIGZsb3cgZ29pbmcgdGhyb3VnaCBvdXRwdXQsIHRoZXJlIGlzIGZsb3dcclxuICAgICAgICAgICAgdmFyIG91dHB1dCA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGU+KE5vZGVzUGF0aC5LZXlzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLCBib29sPikoeCA9PiB4LklkZW50aWZpZXIgPT0gXCJPdXRwdXRcIikpLlNpbmdsZU9yRGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBpZiAob3V0cHV0ID09IG51bGwgfHwgTm9kZXNQYXRoW291dHB1dF0gPT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLy8gTm8gZmxvd1xyXG4gICAgICAgICAgICAgICAgTG9nLldyaXRlKFwiTm8gZmxvd1wiLCBMb2cuU2V2ZXJpdHkuSW5mbyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyBBcHBseSBmbG93XHJcbiAgICAgICAgICAgICAgICBMb2cuV3JpdGUoXCJBcHBseWluZyBmbG93XCIsIExvZy5TZXZlcml0eS5JbmZvKTtcclxuICAgICAgICAgICAgICAgIE5ld0Zsb3dBcHBseShSZW5kZXJQYXRoKE5vZGVzWzBdLCBvdXRwdXQsIE5vZGVzUGF0aCkpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBOZXdGbG93QXBwbHkoTGlzdDxOb2RlPiBwYXRoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkNvdW50PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPihwYXRoKSAtIDE7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLy8gU2VsZWN0IG5vZGU6bmV4dE5vZGVcclxuICAgICAgICAgICAgICAgIE5vZGUgcHJldk5vZGUgPSBwYXRoW2ldO1xyXG4gICAgICAgICAgICAgICAgTm9kZSBuZXh0Tm9kZSA9IHBhdGhbaSArIDFdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIE5vdyBzZXQgdGhlIGVkZ2UgYmV0d2VlbiB0aGVtIHRvIHRoZSBvcHBvc2l0ZSB2YWx1ZVxyXG4gICAgICAgICAgICAgICAgRWRnZSBlZGdlQmV0d2Vlbk5vZGVzID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5VbmlvbjxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZT4ocHJldk5vZGUuT3V0cHV0RWRnZXMscHJldk5vZGUuSW5wdXRFZGdlcykuV2hlcmUoKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2UsIGJvb2w+KShlZGdlID0+IGVkZ2UuRnJvbSA9PSBuZXh0Tm9kZSB8fCBlZGdlLlRvID09IG5leHROb2RlKSkuU2luZ2xlKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIShlZGdlQmV0d2Vlbk5vZGVzIGlzIFRpbWVDaHVuaykpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWRnZUJldHdlZW5Ob2Rlcy5TZXRDdXJyZW50RmxvdyhlZGdlQmV0d2Vlbk5vZGVzLkdldEN1cnJlbnRGbG93KG51bGwsIG51bGwsIFwiRmxvdyBBcHBseVwiKSA9PSAwID8gMSA6IDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgREVCVUdfV3JpdGVGbG93UGF0aChEaWN0aW9uYXJ5PE5vZGUsIE5vZGU+IEZsb3dQYXRoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3RyaW5nIG91dHB1dCA9IFwiS2V5czogXCIgKyBTdHJpbmcuSm9pbihcIiB8IFwiLCBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLlNlbGVjdDxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSxzdHJpbmc+KEZsb3dQYXRoLktleXMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsIHN0cmluZz4pKHggPT4geC5JZGVudGlmaWVyKSkpO1xyXG4gICAgICAgICAgICBvdXRwdXQgKz0gXCJcXG5cIjtcclxuICAgICAgICAgICAgb3V0cHV0ICs9IFwiVmFsdWVzOiBcIiArIFN0cmluZy5Kb2luKFwiIHwgXCIsIFN5c3RlbS5MaW5xLkVudW1lcmFibGUuU2VsZWN0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLHN0cmluZz4oRmxvd1BhdGguVmFsdWVzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLCBzdHJpbmc+KSh4ID0+IHggPT0gbnVsbCA/IFwiLS0tXCIgOiB4LklkZW50aWZpZXIpKSk7XHJcbiAgICAgICAgICAgIExvZy5Xcml0ZShvdXRwdXQsIExvZy5TZXZlcml0eS5JbmZvKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgTGlzdDxOb2RlPiBSZW5kZXJQYXRoKE5vZGUgcm9vdE5vZGUsIE5vZGUgZW5kTm9kZSwgRGljdGlvbmFyeTxOb2RlLCBOb2RlPiBmbG93UGF0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIExpc3Q8Tm9kZT4gcGF0aCA9IG5ldyBMaXN0PE5vZGU+KCk7XHJcbiAgICAgICAgICAgIHBhdGguQWRkKGVuZE5vZGUpO1xyXG5cclxuICAgICAgICAgICAgTm9kZSBuZXh0Tm9kZSA9IGVuZE5vZGU7XHJcbiAgICAgICAgICAgIHdoaWxlIChuZXh0Tm9kZSAhPSByb290Tm9kZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmV4dE5vZGUgPSBmbG93UGF0aFtuZXh0Tm9kZV07XHJcbiAgICAgICAgICAgICAgICBwYXRoLkFkZChuZXh0Tm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHBhdGguUmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gcGF0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgTGlzdDxBc3NpZ25tZW50UHJldmlldz4gR2V0UmVzdWx0RnJvbUdyYXBoKGludCBkYXkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBMb2cuV3JpdGUoXCJTdGFydGluZyBHZXRSZXN1bHRGcm9tR3JhcGhcIiwgTG9nLlNldmVyaXR5LkluZm8pO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRpbWVOb2RlcyA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGU+KE5vZGVzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLCBib29sPikobm9kZSA9PiBub2RlLlZhbHVlICE9IC0xKSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgdXNlZFRpbWVOb2RlcyA9IHRpbWVOb2Rlcy5XaGVyZSgoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSwgYm9vbD4pKG5vZGUgPT4gbm9kZS5JbnB1dEVkZ2VzLkNvdW50ICE9IDApKTtcclxuXHJcbiAgICAgICAgICAgIExvZy5Xcml0ZShcIlRpbWUgbm9kZXMgdG90YWw6IFwiICsgdXNlZFRpbWVOb2Rlcy5Db3VudCgpLCBMb2cuU2V2ZXJpdHkuSW5mbyk7XHJcblxyXG4gICAgICAgICAgICAvL3ZhciBlZGdlcyA9IHVzZWRUaW1lTm9kZXMuU2VsZWN0KG5vZGUgPT4gbm9kZS5JbnB1dEVkZ2VzLldoZXJlKGVkZ2UgPT4gZWRnZS5HZXRDdXJyZW50RmxvdyhudWxsLCBudWxsKSA9PSAxKS5TaW5nbGUoKSk7XHJcbiAgICAgICAgICAgIHZhciBlZGdlcyA9IHVzZWRUaW1lTm9kZXMuV2hlcmUoKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsIGJvb2w+KShub2RlID0+IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2U+KG5vZGUuSW5wdXRFZGdlcywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZSwgYm9vbD4pKGVkZ2UgPT4gZWRnZS5HZXRDdXJyZW50RmxvdyhudWxsLCBudWxsLCBcIkdldFJlc3VsdFwiKSA9PSAxKSkuQ291bnQoKSA9PSAxKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5TZWxlY3Q8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2U+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLCBnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZT4pKG5vZGUgPT4gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZT4obm9kZS5JbnB1dEVkZ2VzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlLCBib29sPikoZWRnZSA9PiBlZGdlLkdldEN1cnJlbnRGbG93KG51bGwsIG51bGwsIFwiR2V0UkVzdWx0MlwiKSA9PSAxKSkuU2luZ2xlKCkpKTtcclxuXHJcbiAgICAgICAgICAgIExvZy5Xcml0ZShcIlRpbWUgbm9kZXMgd2l0aCBzZWxlY3RlZCBlZGdlOiBcIiArIGVkZ2VzLkNvdW50KCksIExvZy5TZXZlcml0eS5JbmZvKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBlZGdlcy5TZWxlY3Q8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkZsb3cuQXNzaWdubWVudFByZXZpZXc+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlLCBnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRmxvdy5Bc3NpZ25tZW50UHJldmlldz4pKGVkZ2UgPT4gbmV3IEFzc2lnbm1lbnRQcmV2aWV3KClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYXNzaWduZWRTdHVkZW50ID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KShzdHVkZW50ID0+IHN0dWRlbnQubmFtZSA9PSBlZGdlLkZyb20uSWRlbnRpZmllci5TcGxpdCgnOicpWzFdKSkuU2luZ2xlKCksXHJcbiAgICAgICAgICAgICAgICBkYXkgPSBkYXksXHJcbiAgICAgICAgICAgICAgICB0aW1lU3RhcnQgPSBlZGdlLlRvLlZhbHVlXHJcbiAgICAgICAgICAgIH0pKS5PcmRlckJ5PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkZsb3cuQXNzaWdubWVudFByZXZpZXcsIGludD4pKHJlc3VsdCA9PiByZXN1bHQudGltZVN0YXJ0KSkuVG9MaXN0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgQXBwbHlTdHVkZW50KEFzc2lnbm1lbnRQcmV2aWV3IHJlc3VsdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5hc3NpZ25lZFN0dWRlbnQuYXNzaWduZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICByZXN1bHQuYXNzaWduZWRTdHVkZW50LmFzc2lnbmVkRGF5ID0gcmVzdWx0LmRheTtcclxuICAgICAgICAgICAgcmVzdWx0LmFzc2lnbmVkU3R1ZGVudC5hc3NpZ25lZE1pbnV0ZXMgPSByZXN1bHQudGltZVN0YXJ0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIEFwcGx5RmxvdyhOb2RlIHJvb3ROb2RlLCBOb2RlIGVuZE5vZGUsIERpY3Rpb25hcnk8Tm9kZSwgTm9kZT4gZmxvd1BhdGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBOb2RlIG5leHROb2RlID0gZW5kTm9kZTtcclxuICAgICAgICAgICAgd2hpbGUgKG5leHROb2RlICE9IHJvb3ROb2RlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBFZGdlSW5mbyBlZGdlID0gR2V0RWRnZUluZm8obmV4dE5vZGUsIGZsb3dQYXRoW25leHROb2RlXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGVkZ2UuSXNGcm9tTm9kZTFUb05vZGUyKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVkZ2UuUmVzdWx0RWRnZS5TZXRDdXJyZW50RmxvdygwKTtcclxuICAgICAgICAgICAgICAgICAgICBMb2cuV3JpdGUoc3RyaW5nLkZvcm1hdChcIlNldHRpbmcgZWRnZSBmbG93IGZyb20gezB9IHRvIHsxfSB0byAwXCIsZWRnZS5SZXN1bHRFZGdlLkZyb20uSWRlbnRpZmllcixlZGdlLlJlc3VsdEVkZ2UuVG8uSWRlbnRpZmllciksIExvZy5TZXZlcml0eS5XYXJuaW5nKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBlZGdlLlJlc3VsdEVkZ2UuU2V0Q3VycmVudEZsb3coMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgTG9nLldyaXRlKHN0cmluZy5Gb3JtYXQoXCJTZXR0aW5nIGVkZ2UgZmxvdyBmcm9tIHswfSB0byB7MX0gdG8gMVwiLGVkZ2UuUmVzdWx0RWRnZS5Gcm9tLklkZW50aWZpZXIsZWRnZS5SZXN1bHRFZGdlLlRvLklkZW50aWZpZXIpLCBMb2cuU2V2ZXJpdHkuSW5mbyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbmV4dE5vZGUgPSBmbG93UGF0aFtuZXh0Tm9kZV07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgRWRnZUluZm8gR2V0RWRnZUluZm8oTm9kZSBub2RlMSwgTm9kZSBub2RlMilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIEVkZ2VJbmZvIHJlc3VsdCA9IG5ldyBFZGdlSW5mbygpO1xyXG4gICAgICAgICAgICBFZGdlIGVkZyA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2U+KG5vZGUxLk91dHB1dEVkZ2VzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlLCBib29sPikoZWRnZSA9PiBlZGdlLlRvID09IG5vZGUyKSkuRmlyc3RPckRlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgICAgIHJlc3VsdC5Jc0Zyb21Ob2RlMVRvTm9kZTIgPSBlZGcgIT0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIGlmIChlZGcgPT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZWRnID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZT4obm9kZTEuSW5wdXRFZGdlcywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZSwgYm9vbD4pKGVkZ2UgPT4gZWRnZS5Gcm9tID09IG5vZGUyKSkuRmlyc3RPckRlZmF1bHQoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmVzdWx0LlJlc3VsdEVkZ2UgPSBlZGc7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdHJ1Y3QgRWRnZUluZm9cclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHB1YmxpYyBFZGdlIFJlc3VsdEVkZ2U7XHJcbiAgICAgICAgICAgIHB1YmxpYyBib29sIElzRnJvbU5vZGUxVG9Ob2RlMjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RydWN0IEFzc2lnbm1lbnRQcmV2aWV3XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwdWJsaWMgaW50IHRpbWVTdGFydDtcclxuICAgICAgICAgICAgcHVibGljIGludCBkYXk7XHJcbiAgICAgICAgICAgIHB1YmxpYyBVc2VyIGFzc2lnbmVkU3R1ZGVudDtcclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHN0cmluZyBUb1N0cmluZygpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHJpbmcgY29tbWFuZCA9IFwiZ3JhcGggTFJcXHJcXG5cIjtcclxuXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKE5vZGUgbiBpbiBOb2RlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoRWRnZSBvdXRwdXRFZGdlIGluIG4uT3V0cHV0RWRnZXMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZCArPSBzdHJpbmcuRm9ybWF0KFwiezB9IC0tPnx7MX18IHsyfVxcclxcblwiLG91dHB1dEVkZ2UuRnJvbS5JZGVudGlmaWVyLG91dHB1dEVkZ2UuR2V0Q3VycmVudEZsb3cobmV3IE5vZGVbMF0sIHRoaXMsIFwiVGhpc1RvU3RyaW5nXCIpLG91dHB1dEVkZ2UuVG8uSWRlbnRpZmllcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgICByZXR1cm4gY29tbWFuZDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xyXG5cclxubmFtZXNwYWNlIFN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3dcclxue1xyXG4gICAgcHVibGljIGNsYXNzIE5vZGVcclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgZW51bSBOb2RlVHlwZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgRGVmYXVsdCxcclxuICAgICAgICAgICAgSW5wdXQsXHJcbiAgICAgICAgICAgIE91dHB1dFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0cmluZyBJZGVudGlmaWVyO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgVmFsdWU7XHJcblxyXG4gICAgICAgIHB1YmxpYyBMaXN0PEVkZ2U+IElucHV0RWRnZXM7XHJcbiAgICAgICAgcHVibGljIExpc3Q8RWRnZT4gT3V0cHV0RWRnZXM7XHJcblxyXG4gICAgICAgIHB1YmxpYyBOb2RlVHlwZSBUeXBlO1xyXG5cclxuICAgICAgICBwdWJsaWMgTm9kZShzdHJpbmcgaWRlbnRpZmllciwgaW50IHZhbHVlLCBOb2RlVHlwZSB0eXBlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgSWRlbnRpZmllciA9IGlkZW50aWZpZXI7XHJcbiAgICAgICAgICAgIFZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgICAgIHRoaXMuVHlwZSA9IHR5cGU7XHJcbiAgICAgICAgICAgIHRoaXMuSW5wdXRFZGdlcyA9IG5ldyBMaXN0PEVkZ2U+KCk7XHJcbiAgICAgICAgICAgIHRoaXMuT3V0cHV0RWRnZXMgPSBuZXcgTGlzdDxFZGdlPigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpY1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgVXNlclxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgbmFtZTtcclxuICAgICAgICBwdWJsaWMgYm9vbFtdIGRheXNBdmFpbGFibGU7XHJcbiAgICAgICAgcHVibGljIGludFtdIG1pbnV0ZXNGcm9tQXZhaWxhYmxlO1xyXG4gICAgICAgIHB1YmxpYyBpbnRbXSBtaW51dGVzVG9BdmFpbGFibGU7XHJcbiAgICAgICAgcHVibGljIGludCBhc3NpZ25lZE1pbnV0ZXMgPSAtMTtcclxuICAgICAgICBwdWJsaWMgaW50IGFzc2lnbmVkRGF5ID0gLTE7XHJcbiAgICAgICAgcHVibGljIGJvb2wgYXNzaWduZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgcHVibGljIFVzZXIoc3RyaW5nIG5hbWUsIGJvb2xbXSBkYXlzQXZhaWxhYmxlLCBpbnRbXSBtaW51dGVzRnJvbUF2YWlsYWJsZSwgaW50W10gbWludXRlc1RvQXZhaWxhYmxlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICAgICAgdGhpcy5kYXlzQXZhaWxhYmxlID0gZGF5c0F2YWlsYWJsZTtcclxuICAgICAgICAgICAgdGhpcy5taW51dGVzRnJvbUF2YWlsYWJsZSA9IG1pbnV0ZXNGcm9tQXZhaWxhYmxlO1xyXG4gICAgICAgICAgICB0aGlzLm1pbnV0ZXNUb0F2YWlsYWJsZSA9IG1pbnV0ZXNUb0F2YWlsYWJsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdHJpbmcgR2V0SG91cnNJbkRheShpbnQgZGF5SW5kZXgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoZGF5SW5kZXggPCAwIHx8IGRheUluZGV4ID49IDUpXHJcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgQXJndW1lbnRFeGNlcHRpb24oXCJQYXJhbWV0ZXIgTVVTVCBCRSBpbiByYW5nZSBbMDsgNSkuIFZhbHVlOiBcIiArIGRheUluZGV4LCBcImRheUluZGV4XCIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFkYXlzQXZhaWxhYmxlW2RheUluZGV4XSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIk5lbsOtIG5hc3RhdmVub1wiO1xyXG5cclxuICAgICAgICAgICAgaW50IG1pbnV0ZXNGID0gbWludXRlc0Zyb21BdmFpbGFibGVbZGF5SW5kZXhdO1xyXG4gICAgICAgICAgICBpbnQgbWludXRlc1QgPSBtaW51dGVzVG9BdmFpbGFibGVbZGF5SW5kZXhdO1xyXG5cclxuICAgICAgICAgICAgaW50IGhvdXJzRiA9IChpbnQpTWF0aC5GbG9vcihtaW51dGVzRiAvIDYwZCk7XHJcbiAgICAgICAgICAgIGludCBob3Vyc1QgPSAoaW50KU1hdGguRmxvb3IobWludXRlc1QgLyA2MGQpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZy5Gb3JtYXQoXCJPZCB7MH06ezF9IGRvIHsyfTp7M31cIixob3Vyc0YsKG1pbnV0ZXNGIC0gaG91cnNGICogNjApLlRvU3RyaW5nKFwiMDBcIiksaG91cnNULChtaW51dGVzVCAtIGhvdXJzVCAqIDYwKS5Ub1N0cmluZyhcIjAwXCIpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwidXNpbmcgQnJpZGdlLkh0bWw1O1xyXG51c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlclxyXG57XHJcbiAgICBwdWJsaWMgc3RhdGljIGNsYXNzIExvZ1xyXG4gICAge1xyXG4gICAgICAgIGNvbnN0IGludCBsZW5ndGhDb2xsYXBzZVN0YXJ0ID0gaW50Lk1heFZhbHVlO1xyXG4gICAgICAgIGNvbnN0IGludCBwcmV2aWV3TGVuZ3RoID0gMzA7XHJcblxyXG4gICAgICAgIHB1YmxpYyBlbnVtIFNldmVyaXR5XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBJbmZvLFxyXG4gICAgICAgICAgICBXYXJuaW5nLFxyXG4gICAgICAgICAgICBDcml0aWNhbFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgSFRNTERpdkVsZW1lbnQgdGFyZ2V0O1xyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIHZvaWQgSW5pdGlhbGl6ZVdpdGhEaXYoSFRNTERpdkVsZW1lbnQgdGFyZ2V0RGl2KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0RGl2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW50IGNvdW50ZXIgPSAwO1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgdm9pZCBXcml0ZShvYmplY3QgbywgU2V2ZXJpdHkgc2V2ZXJpdHkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBMb2cgb2JqZWN0IHRvIGphdmFzY3JpcHQgY29uc29sZVxyXG4gICAgICAgICAgICBCcmlkZ2UuU2NyaXB0LkNhbGwoXCJjb25zb2xlLmxvZ1wiLCBvKTtcclxuICAgICAgICAgICAgLy8gTG9nIG9iamVjdCB3aXRoIHNldmVyaXR5IHRvIHRoZSBkaXZcclxuICAgICAgICAgICAgc3RyaW5nIHRleHQgPSBvLlRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAgICAgICBzdHJpbmcgaHRtbCA9IFN0cmluZy5FbXB0eTtcclxuICAgICAgICAgICAgLy8gSWYgdGhlIHRleHQgaXMgdmVyeSBsb25nLCBjb2xsYXBzZSBpdFxyXG4gICAgICAgICAgICBpZih0ZXh0Lkxlbmd0aCA+IGxlbmd0aENvbGxhcHNlU3RhcnQpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgc3RyaW5nIHByZXZpZXcgPSB0ZXh0LlN1YnN0cmluZygwLCBwcmV2aWV3TGVuZ3RoKSArIFwiLi4uXCI7XHJcbiAgICAgICAgICAgICAgICBodG1sID0gXCI8YnV0dG9uIHR5cGU9J2J1dHRvbicgY2xhc3M9J2xvZ0V4cGFuZGFibGUnIGRhdGEtdG9nZ2xlPSdjb2xsYXBzZScgZGF0YS10YXJnZXQ9JyNjb2xsYXBzZS1sb2ctXCIgKyBjb3VudGVyICsgXCInPlwiICsgXCI8cCBzdHlsZT0nY29sb3I6IFwiICsgR2V0Q29sb3JCYXNlZE9uU2V2ZXJpdHkoc2V2ZXJpdHkpICsgXCI7Jz5cIiArIHByZXZpZXcgKyBcIjwvcD48L2Rpdj5cIjtcclxuICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPSdjb2xsYXBzZSByb3cnIGlkPSdjb2xsYXBzZS1sb2ctXCIgKyBjb3VudGVyICsgXCInPjxkaXYgY2xhc3M9J2NhcmQgY2FyZC1ib2R5Jz5cIiArIHRleHQgKyBcIjwvZGl2PjwvZGl2PlwiO1xyXG4gICAgICAgICAgICAgICAgY291bnRlcisrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaHRtbCA9IFwiPHAgc3R5bGU9J2NvbG9yOiBcIiArIEdldENvbG9yQmFzZWRPblNldmVyaXR5KHNldmVyaXR5KSArIFwiOyc+XCIgKyB0ZXh0ICsgXCI8cD5cIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgV3JpdGVUb0RlYnVnKGh0bWwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBXcml0ZVRvRGVidWcoc3RyaW5nIGh0bWwpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0YXJnZXQuSW5uZXJIVE1MICs9IGh0bWwgKyBcIjxociAvPlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgc3RyaW5nIEdldENvbG9yQmFzZWRPblNldmVyaXR5KFNldmVyaXR5IHNldmVyaXR5KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3dpdGNoIChzZXZlcml0eSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBTZXZlcml0eS5JbmZvOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIkJsYWNrXCI7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFNldmVyaXR5Lldhcm5pbmc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiR3JlZW5cIjtcclxuICAgICAgICAgICAgICAgIGNhc2UgU2V2ZXJpdHkuQ3JpdGljYWw6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiUmVkXCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBcIkJsYWNrXCI7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93XHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBUaW1lQ2h1bmsgOiBFZGdlXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIFRpbWVDaHVuayhOb2RlIGZyb20sIE5vZGUgdG8pIDogYmFzZSgwLCAwLCBmcm9tLCB0bykgeyB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgaW50IEdldEJsb2NraW5nTm9kZXMoSUVudW1lcmFibGU8Tm9kZT4gdGltZU5vZGVzLCBOb2RlIGJhc2VOb2RlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaW50IGJsb2NraW5nTm9kZXMgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPih0aW1lTm9kZXMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsIGJvb2w+KSh0Tm9kZSA9PiBNYXRoLkFicyh0Tm9kZS5WYWx1ZSAtIGJhc2VOb2RlLlZhbHVlKSA8IDUwKSkuQ291bnQoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChibG9ja2luZ05vZGVzID09IDApXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIExvZy5Xcml0ZShcIkkganVzdCBwYXNzZWQgd2l0aCB0aGlzIHNldHRpbmdzOiBcIiArIFN0cmluZy5Kb2luKFwiICwgXCIsIFN5c3RlbS5MaW5xLkVudW1lcmFibGUuU2VsZWN0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLHN0cmluZz4odGltZU5vZGVzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLCBzdHJpbmc+KShub2RlID0+IG5vZGUuSWRlbnRpZmllciArIFwiIHdpdGggdmFsdWUgXCIgKyBub2RlLlZhbHVlKSkpICsgXCIuIEJhc2Ugd2FzIFwiICsgYmFzZU5vZGUuSWRlbnRpZmllciArIFwiIHdpdGggdmFsdWUgXCIgKyBiYXNlTm9kZS5WYWx1ZSwgTG9nLlNldmVyaXR5LkNyaXRpY2FsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIExvZy5Xcml0ZShcIkkgZGlkbid0IHBhc3Mgd2l0aCB0aGlzIHNldHRpbmdzOlwiICsgU3RyaW5nLkpvaW4oXCIgLCBcIiwgU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5TZWxlY3Q8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsc3RyaW5nPih0aW1lTm9kZXMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsIHN0cmluZz4pKG5vZGUgPT4gbm9kZS5JZGVudGlmaWVyICsgXCIgd2l0aCB2YWx1ZSBcIiArIG5vZGUuVmFsdWUpKSkgKyBcIi4gQmFzZSB3YXMgXCIgKyBiYXNlTm9kZS5JZGVudGlmaWVyICsgXCIgd2l0aCB2YWx1ZSBcIiArIGJhc2VOb2RlLlZhbHVlLCBMb2cuU2V2ZXJpdHkuQ3JpdGljYWwpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gYmxvY2tpbmdOb2RlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cclxuICAgICAgICAvLy8gXHJcbiAgICAgICAgLy8vIDwvc3VtbWFyeT5cclxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJjdXJyZW50UGF0aFwiPjwvcGFyYW0+XHJcbiAgICAgICAgLy8vIDxwYXJhbSBuYW1lPVwiZmxvd1wiPjwvcGFyYW0+XHJcbiAgICAgICAgLy8vIDxyZXR1cm5zPk51bWJlciBvZiBub2RlcyB0aGF0IGJsb2NrIGN1cnJlbnQgcGF0aDwvcmV0dXJucz5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgaW50IEdldEN1cnJlbnRGbG93KElFbnVtZXJhYmxlPE5vZGU+IGN1cnJlbnRQYXRoLCBGbG93IGZsb3csIHN0cmluZyBpbmZvKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgaWYgKGluZm8gPT0gXCJUaGlzVG9TdHJpbmdcIilcclxuICAgICAgICAgICAgICAgIHJldHVybiBpbnQuTWluVmFsdWU7XHJcblxyXG4gICAgICAgICAgICBpbnQgYmxvY2tpbmdOb2RlcyA9IC0xO1xyXG4gICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTm9kZSBiYXNlTm9kZSA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuVG9MaXN0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPihjdXJyZW50UGF0aClbU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5Db3VudDxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZT4oY3VycmVudFBhdGgpIC0gMl07XHJcbiAgICAgICAgICAgICAgICBMb2cuV3JpdGUoXCJHZXRDdXJyZW50RmxvdyBQYXRoOiBcIiArIFN0cmluZy5Kb2luPGludD4oXCIsXCIsIFN5c3RlbS5MaW5xLkVudW1lcmFibGUuU2VsZWN0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLGludD4oY3VycmVudFBhdGgsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsIGludD4pKG5vZGUgPT4gbm9kZS5WYWx1ZSkpKSwgTG9nLlNldmVyaXR5LkluZm8pO1xyXG4gICAgICAgICAgICAgICAgdmFyIGFsbFRpbWVOb2RlcyA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGU+KGZsb3cuTm9kZXMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsIGJvb2w+KShub2RlID0+IG5vZGUuVmFsdWUgIT0gLTEgJiYgbm9kZSAhPSBiYXNlTm9kZSAmJiBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlPihub2RlLklucHV0RWRnZXMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2UsIGJvb2w+KShlZGdlID0+IGVkZ2UuR2V0Q3VycmVudEZsb3cobnVsbCwgbnVsbCwgXCJHZXRDdXJyZW50Rmxvd1wiKSA9PSAxKSkuQ291bnQoKSA9PSAxKSkuVG9MaXN0KCk7XHJcblN5c3RlbS5MaW5xLkVudW1lcmFibGUuVW5pb248Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGU+KCAgICAgICAgICAgICAgICBhbGxUaW1lTm9kZXMsU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZT4oY3VycmVudFBhdGgsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsIGJvb2w+KShub2RlID0+IG5vZGUuVmFsdWUgIT0gLTEgJiYgbm9kZSAhPSBiYXNlTm9kZSkpKTtcclxuICAgICAgICAgICAgICAgIExvZy5Xcml0ZShcIlN0YXJ0aW5nIEJsb2NraW5nTm9kZXMuLi5cIiwgTG9nLlNldmVyaXR5LkluZm8pO1xyXG4gICAgICAgICAgICAgICAgYmxvY2tpbmdOb2RlcyA9IEdldEJsb2NraW5nTm9kZXMoYWxsVGltZU5vZGVzLCBiYXNlTm9kZSk7XHJcbiAgICAgICAgICAgICAgICBMb2cuV3JpdGUoXCJFbmRpbmcgQmxvY2tpbmdOb2Rlcy4uLlwiLCBMb2cuU2V2ZXJpdHkuSW5mbyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKEV4Y2VwdGlvbiBleClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTG9nLldyaXRlKFwiQmxvY2tpbmdOb2RlcyBGYWlsZWQhIEluZm86IFwiICsgaW5mbywgTG9nLlNldmVyaXR5LkNyaXRpY2FsKTtcclxuICAgICAgICAgICAgICAgIExvZy5Xcml0ZShleCwgTG9nLlNldmVyaXR5LkNyaXRpY2FsKTtcclxuICAgICAgICAgICAgICAgIHRocm93IGV4O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBibG9ja2luZ05vZGVzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIG92ZXJyaWRlIHZvaWQgU2V0Q3VycmVudEZsb3coaW50IG5ld1ZhbHVlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gRG8gbm90aGluZ1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iXQp9Cg==
