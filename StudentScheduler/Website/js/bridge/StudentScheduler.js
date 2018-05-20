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

            StudentScheduler.App.Gid("run").onclick = function (e) {
                StudentScheduler.App.plan.Calc();
                StudentScheduler.App.Gid("output").innerHTML = StudentScheduler.App.plan.GenerateHTML();
            };

            // Test
            StudentScheduler.App.Gid("test").onclick = function (e) {
                StudentScheduler.App.plan.teachers.add(new StudentScheduler.AppLogic.User("Test Teacher", System.Array.init([true, false, true, false, false], System.Boolean), System.Array.init([720, 0, 840, 0, 0], System.Int32), System.Array.init([1200, 0, 1140, 0, 0], System.Int32)));

                StudentScheduler.App.plan.students.add(new StudentScheduler.AppLogic.User("Student 1", System.Array.init([true, false, false, false, false], System.Boolean), System.Array.init([900, 0, 0, 0, 0], System.Int32), System.Array.init([960, 0, 0, 0, 0], System.Int32)));
                StudentScheduler.App.plan.students.add(new StudentScheduler.AppLogic.User("Student 2", System.Array.init([true, false, false, false, false], System.Boolean), System.Array.init([660, 0, 0, 0, 0], System.Int32), System.Array.init([1080, 0, 0, 0, 0], System.Int32)));
                StudentScheduler.App.plan.students.add(new StudentScheduler.AppLogic.User("Student 3", System.Array.init([true, false, false, false, false], System.Boolean), System.Array.init([720, 0, 0, 0, 0], System.Int32), System.Array.init([840, 0, 0, 0, 0], System.Int32)));
                StudentScheduler.App.plan.students.add(new StudentScheduler.AppLogic.User("Student 4", System.Array.init([true, false, false, false, false], System.Boolean), System.Array.init([0, 0, 0, 0, 0], System.Int32), System.Array.init([1439, 0, 0, 0, 0], System.Int32)));


                /* plan.teachers.Add(new User("Test Teacher", new bool[] { true, false, false, false, false }, new int[] { 10 * 60, 0, 0, 0, 0 }, new int[] { 12 * 60, 0, 0, 0, 0 }));

                plan.students.Add(new User("Student 2", new bool[] { true, false, false, false, false }, new int[] { 10 * 60, 0, 0, 0, 0 }, new int[] { 12 * 60, 0, 0, 0, 0 }));
                plan.students.Add(new User("Student 1", new bool[] { true, false, false, false, false }, new int[] { 10 * 60 + 10, 0, 0, 0, 0 }, new int[] { 11 * 60 + 50, 0, 0, 0, 0 }));
                */
                StudentScheduler.App.plan.Calc();
                StudentScheduler.App.Gid("output").innerHTML = StudentScheduler.App.plan.GenerateHTML();
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
                    return System.Linq.Enumerable.from(document.body.getElementsByClassName(cls)).toArray();
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
            GetCurrentFlow: function (currentPath, flow) {
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
                    System.Console.WriteLine(System.String.format("===================DEN: {0}==============", [Bridge.box(day, System.Int32)]));
                    this.BuildGraph(day);
                    this.Start();
                    System.Console.WriteLine("Dobehlo to...");
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

                System.Console.WriteLine("Break: ");
                System.Console.WriteLine(Bridge.toArray(breaks).join(", "));

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
            CreateNewFlow: function () {
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
                    var renderedPath = this.RenderPath(System.Linq.Enumerable.from(this.Nodes).first(), node, FlowPath);
                    $t = Bridge.getEnumerator(node.OutputEdges);
                    try {
                        while ($t.moveNext()) {
                            var outputEdge = $t.Current;
                            var flow = outputEdge.GetCurrentFlow(renderedPath, this);
                            if (flow > 1) {
                                doInputEdges = false;
                            }
                            if (flow === 0) {
                                avaiableNodes.add(outputEdge.To);
                            }
                        }
                    } finally {
                        if (Bridge.is($t, System.IDisposable)) {
                            $t.System$IDisposable$dispose();
                        }
                    }if (doInputEdges) {
                        $t1 = Bridge.getEnumerator(node.InputEdges);
                        try {
                            while ($t1.moveNext()) {
                                var inputEdge = $t1.Current;
                                if (renderedPath.Count >= 2 && Bridge.referenceEquals(inputEdge.From, renderedPath.getItem(((renderedPath.Count - 2) | 0)))) {
                                    continue;
                                }

                                var flow1 = inputEdge.GetCurrentFlow(renderedPath, this);
                                if (flow1 === 1) {
                                    avaiableNodes.add(inputEdge.From);
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
                System.Console.WriteLine(this.toString());
                this.DEBUG_WriteFlowPath(FlowPath);
                var TimeChunk = System.Linq.Enumerable.from(FlowPath.getKeys()).where(function (x) {
                        return Bridge.referenceEquals(x.Identifier, "TimeChunk");
                    }).singleOrDefault(null, null);
                if (TimeChunk == null || FlowPath.get(TimeChunk) == null) {
                    System.Console.WriteLine("No flow");
                    // No flow
                    return false;
                } else {
                    System.Console.WriteLine("Applying flow");
                    this.ApplyFlow(System.Linq.Enumerable.from(this.Nodes).first(), TimeChunk, FlowPath);
                    return true;
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
                System.Console.WriteLine(output);
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
                System.Console.Write("Startuje GetResultFromGraph");

                var timeNodes = System.Linq.Enumerable.from(this.Nodes).where(function (node) {
                        return node.Value !== -1;
                    });

                var usedTimeNodes = timeNodes.where(function (node) {
                    return node.InputEdges.Count !== 0;
                });

                System.Console.Write(usedTimeNodes.count());

                //var edges = usedTimeNodes.Select(node => node.InputEdges.Where(edge => edge.GetCurrentFlow(null, null) == 1).Single());
                var edges = usedTimeNodes.where(function (node) {
                    return System.Linq.Enumerable.from(node.InputEdges).where(function (edge) {
                            return edge.GetCurrentFlow(null, null) === 1;
                        }).count() === 1;
                }).select(function (node) {
                    return System.Linq.Enumerable.from(node.InputEdges).where(function (edge) {
                            return edge.GetCurrentFlow(null, null) === 1;
                        }).single();
                });

                System.Console.WriteLine(edges.count());

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
                        System.Console.WriteLine(System.String.format("Setting edge flow from {0} to {1} to 0", edge.ResultEdge.From.Identifier, edge.ResultEdge.To.Identifier));
                    } else {
                        edge.ResultEdge.SetCurrentFlow(1);
                        System.Console.WriteLine(System.String.format("Setting edge flow from {0} to {1} to 1", edge.ResultEdge.From.Identifier, edge.ResultEdge.To.Identifier));
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
                                command = (command || "") + ((System.String.format("{0} -->|{1}| {2}\r\n", outputEdge.From.Identifier, Bridge.box(outputEdge.GetCurrentFlow(System.Array.init(0, null, StudentScheduler.AppLogic.NetworkFlow.Node), this), System.Int32), outputEdge.To.Identifier)) || "");
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
                    console.log(ex);
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
                                System.Console.WriteLine(System.Linq.Enumerable.from(studentsToday).where(function (x) {
                                        return x.assigned;
                                    }).orderBy(function (x) {
                                    return x.assignedMinutes;
                                }).select(function (x) {
                                    return x.name;
                                }).toArray(System.String).join(", "));
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
                        System.Console.WriteLine(Bridge.toArray(studentsAvailable.select(function (x) {
                                return (x.name || "") + ": " + x.minutesFromAvailable[System.Array.index(day, x.minutesFromAvailable)];
                            })).join(", "));

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

                System.Console.WriteLine("----------------------");
                System.Console.Write((startStudent.name || "") + ",");
                System.Console.WriteLine(Bridge.toArray(anotherStudents.select(function (x) {
                        return x.name;
                    })).join(","));

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

    Bridge.define("StudentScheduler.AppLogic.NetworkFlow.TimeChunk", {
        inherits: [StudentScheduler.AppLogic.NetworkFlow.Edge],
        ctors: {
            ctor: function (from, to) {
                this.$initialize();
                StudentScheduler.AppLogic.NetworkFlow.Edge.ctor.call(this, 0, 0, from, to);
            }
        },
        methods: {
            GetBlockingNodes: function (timeNodes, flow) {
                var $t;
                var blockingNodes = new (System.Collections.Generic.HashSet$1(StudentScheduler.AppLogic.NetworkFlow.Node)).ctor();
                $t = Bridge.getEnumerator(timeNodes, StudentScheduler.AppLogic.NetworkFlow.Node);
                try {
                    while ($t.moveNext()) {
                        var timeNode = { v : $t.Current };
                        var anotherTimeNodes = System.Linq.Enumerable.from(flow.Nodes).where((function ($me, timeNode) {
                                return function (node) {
                                    return node.Value !== -1 && !Bridge.referenceEquals(node, timeNode.v) && System.Linq.Enumerable.from(node.InputEdges).where(function (edge) {
                                            return edge.GetCurrentFlow(null, null) === 1;
                                        }).count() === 1;
                                };
                            })(this, timeNode));
                        var newBlockingNodes = anotherTimeNodes.where((function ($me, timeNode) {
                            return function (node) {
                                return Math.abs(((timeNode.v.Value - node.Value) | 0)) < StudentScheduler.AppLogic.Plan.lessonLength;
                            };
                        })(this, timeNode));
                        newBlockingNodes.forEach(function (node) {
                            return blockingNodes.add(node);
                        });
                    }
                } finally {
                    if (Bridge.is($t, System.IDisposable)) {
                        $t.System$IDisposable$dispose();
                    }
                }
                return blockingNodes.Count;
            },
            /**
             * @instance
             * @public
             * @override
             * @this StudentScheduler.AppLogic.NetworkFlow.TimeChunk
             * @memberof StudentScheduler.AppLogic.NetworkFlow.TimeChunk
             * @param   {System.Collections.Generic.IEnumerable$1}      currentPath    
             * @param   {StudentScheduler.AppLogic.NetworkFlow.Flow}    flow
             * @return  {number}                                                       Number of nodes that block current path
             */
            GetCurrentFlow: function (currentPath, flow) {
                var blockingNodes = this.GetBlockingNodes(System.Linq.Enumerable.from(currentPath).where(function (node) {
                        return node.Value !== -1;
                    }), flow);
                System.Console.WriteLine("Checking timechunk, " + blockingNodes + " blocking nodes found");
                return blockingNodes;
            },
            SetCurrentFlow: function (newValue) {
                // Do nothing
            }
        }
    });
});

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICJTdHVkZW50U2NoZWR1bGVyLmpzIiwKICAic291cmNlUm9vdCI6ICIiLAogICJzb3VyY2VzIjogWyJBcHBMb2dpYy9BcHAuY3MiLCJBcHBMb2dpYy9QbGFuLmNzIiwiQXBwTG9naWMvTmV0d29ya0Zsb3cvRWRnZS5jcyIsIkFwcExvZ2ljL05ldHdvcmtGbG93L0Zsb3cuY3MiLCJBcHBMb2dpYy9OZXR3b3JrRmxvdy9Ob2RlLmNzIiwiQXBwTG9naWMvVXNlci5jcyIsIkFwcExvZ2ljL05ldHdvcmtGbG93L1RpbWVDaHVuay5jcyJdLAogICJuYW1lcyI6IFsiIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7WUF1QllBLDRCQUFPQSxJQUFJQTs7O1lBR1hBLG9CQUFvQkE7WUFDcEJBLGlFQUF5QkEsVUFBQ0E7Z0JBQVFBLG1DQUFjQTs7WUFDaERBLG9CQUFvQkE7WUFDcEJBLGlFQUF5QkEsVUFBQ0E7Z0JBQVFBLG1DQUFjQTs7O1lBRWhEQSxXQUFXQTtZQUNYQSxLQUFLQSxXQUFXQSxJQUFJQSxhQUFhQTtnQkFDN0JBLHdCQUFLQSxHQUFMQSwyREFBS0EsR0FBTEEsZ0JBQW1CQSxVQUFDQTtvQkFBUUEsb0NBQWVBLHdCQUFLQSxHQUFMQTs7OztZQUUvQ0EsT0FBT0E7WUFDUEEsS0FBS0EsWUFBV0EsS0FBSUEsYUFBYUE7Z0JBQzdCQSx3QkFBS0EsSUFBTEEsMkRBQUtBLElBQUxBLGdCQUFtQkEsVUFBQ0E7b0JBQVFBLG9DQUFlQSx3QkFBS0EsSUFBTEE7Ozs7WUFFL0NBLE9BQU9BO1lBQ1BBLEtBQUtBLFlBQVdBLEtBQUlBLGFBQWFBO2dCQUU3QkEsY0FBUUE7Z0JBQ1JBLHdCQUFLQSxJQUFMQSwyREFBS0EsSUFBTEEsZ0JBQW1CQTtxQ0FBQ0E7d0JBQVFBLDJDQUFzQkEsd0JBQUtBLEtBQUxBOzs7O1lBRXREQSxxREFBZ0NBLFVBQUNBO2dCQUFRQTtnQkFBa0JBOzs7WUFFM0RBLDREQUF1Q0EsVUFBQ0E7Z0JBQVFBO2dCQUFtQkE7OztZQUVuRUEs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O2dCQUM3QkEsYUFBYUEsa0JBQUtBLFdBQVdBOztnQkFFN0JBLE9BQU9BLDhDQUFzQ0Esa0NBQU9BLHFCQUFDQSxhQUFXQSwwQ0FBNEJBLGtDQUFPQSxxQkFBQ0EsYUFBV0E7Ozs7Ozs7OzRCQzlCbEdBLE1BQVdBOztpRkFBc0JBLE1BQU1BOzs7O3dDQUUzQkEsV0FBNkJBOztnQkFFdERBLG9CQUE4QkEsS0FBSUE7Z0JBQ2xDQSwwQkFBeUJBOzs7O3dCQUVyQkEsdUJBQXVCQSw0QkFBaUZBLGtCQUFXQSxBQUFnRkE7OzJDQUFRQSxlQUFjQSxNQUFNQSw4QkFBUUEsZUFBWUEsNEJBQWlGQSx1QkFBZ0JBLEFBQWdGQTttREFBUUEsb0JBQW9CQSxNQUFNQTs7Ozt3QkFDdGNBLHVCQUF1QkEsdUJBQXVCQSxBQUFnRkE7O3VDQUFRQSxTQUFTQSxxQkFBaUJBLG9CQUFjQTs7O3dCQUM5S0EseUJBQXlCQSxBQUFnRkE7bUNBQVFBLGtCQUFrQkE7Ozs7Ozs7O2dCQUd2SUEsT0FBT0E7Ozs7Ozs7Ozs7OztzQ0FTd0JBLGFBQStCQTtnQkFFOURBLG9CQUFvQkEsc0JBQWlCQSw0QkFBaUZBLG1CQUFZQSxBQUFnRkE7K0JBQVFBLGVBQWNBO3dCQUFNQTtnQkFDOU9BLHlCQUFrQkEseUJBQXlCQTtnQkFDM0NBLE9BQU9BOztzQ0FHeUJBIiwKICAic291cmNlc0NvbnRlbnQiOiBbInVzaW5nIEJyaWRnZTtcclxudXNpbmcgQnJpZGdlLkh0bWw1O1xyXG51c2luZyBOZXd0b25zb2Z0Lkpzb247XHJcbnVzaW5nIFN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWM7XHJcbnVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG5cclxubmFtZXNwYWNlIFN0dWRlbnRTY2hlZHVsZXJcclxue1xyXG4gICAgcHVibGljIGNsYXNzIEFwcFxyXG4gICAge1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIFBsYW4gcGxhbjtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBib29sIGxhc3RTZXRXYXNUZWFjaGVyO1xyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGludCBsYXN0U2V0SWQ7XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgaW50IGxhc3RTZWxlY3RlZERheTtcclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBpbnQgZGF5SWQ7XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHN0cmluZ1tdIGRheXMgPSB7IFwibW9uZGF5XCIsIFwidHVlc2RheVwiLCBcIndlZG5lc2RheVwiLCBcInRodXJzZGF5XCIsIFwiZnJpZGF5XCIgfTtcclxuXHJcbiAgICAgICAgcHVibGljIHN0YXRpYyB2b2lkIE1haW4oKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gVE9ETzogbG9hZD9cclxuICAgICAgICAgICAgcGxhbiA9IG5ldyBQbGFuKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZWdpc3RlciBjYWxsYmFja3NcclxuICAgICAgICAgICAgdmFyIGJ1dE5ld1RlYWNoZXIgPSBHaWQoXCJhZGQtdGVhY2hlclwiKTtcclxuICAgICAgICAgICAgYnV0TmV3VGVhY2hlci5PbkNsaWNrICs9IChlKSA9PiB7IEFkZE5ld1RlYWNoZXIoYnV0TmV3VGVhY2hlcik7IH07XHJcbiAgICAgICAgICAgIHZhciBidXROZXdTdHVkZW50ID0gR2lkKFwiYWRkLXN0dWRlbnRcIik7XHJcbiAgICAgICAgICAgIGJ1dE5ld1N0dWRlbnQuT25DbGljayArPSAoZSkgPT4geyBBZGROZXdTdHVkZW50KGJ1dE5ld1N0dWRlbnQpOyB9O1xyXG5cclxuICAgICAgICAgICAgdmFyIGJ1dHMgPSBHY2woXCJ0ZWFjaGVyLWNsaWNrXCIpO1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IGJ1dHMuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgICAgICBidXRzW2ldLk9uQ2xpY2sgKz0gKGUpID0+IHsgRWRpdEhvdXJzQ2xpY2soYnV0c1tpXSwgdHJ1ZSk7IH07XHJcblxyXG4gICAgICAgICAgICBidXRzID0gR2NsKFwic3R1ZGVudC1jbGlja1wiKTtcclxuICAgICAgICAgICAgZm9yIChpbnQgaSA9IDA7IGkgPCBidXRzLkxlbmd0aDsgaSsrKVxyXG4gICAgICAgICAgICAgICAgYnV0c1tpXS5PbkNsaWNrICs9IChlKSA9PiB7IEVkaXRIb3Vyc0NsaWNrKGJ1dHNbaV0sIGZhbHNlKTsgfTtcclxuXHJcbiAgICAgICAgICAgIGJ1dHMgPSBHY2woXCJidXQtdGltZS1zZXRcIik7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgYnV0cy5MZW5ndGg7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IGMgPSBpO1xyXG4gICAgICAgICAgICAgICAgYnV0c1tpXS5PbkNsaWNrICs9IChlKSA9PiB7IFNvbWVEYXlFZGl0SG91cnNDbGljayhidXRzW2NdKTsgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS1ob3Vyc1wiKS5PbkNsaWNrID0gKGUpID0+IHsgU2F2ZUhvdXJDaGFuZ2UoKTsgVXBkYXRlTGlzdE9mRGF5cygpOyB9O1xyXG5cclxuICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtaG91cnMtY2FuY2VsXCIpLk9uQ2xpY2sgPSAoZSkgPT4geyBSZW1vdmVIb3VySW5EYXkoKTsgVXBkYXRlTGlzdE9mRGF5cygpOyB9O1xyXG5cclxuICAgICAgICAgICAgR2lkKFwicnVuXCIpLk9uQ2xpY2sgPSAoZSkgPT4geyBwbGFuLkNhbGMoKTsgR2lkKFwib3V0cHV0XCIpLklubmVySFRNTCA9IHBsYW4uR2VuZXJhdGVIVE1MKCk7IH07XHJcblxyXG4gICAgICAgICAgICAvLyBUZXN0XHJcbiAgICAgICAgICAgIEdpZChcInRlc3RcIikuT25DbGljayA9IChlKSA9PlxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBwbGFuLnRlYWNoZXJzLkFkZChuZXcgVXNlcihcIlRlc3QgVGVhY2hlclwiLCBuZXcgYm9vbFtdIHsgdHJ1ZSwgZmFsc2UsIHRydWUsIGZhbHNlLCBmYWxzZSB9LCBuZXcgaW50W10geyAxMiAqIDYwLCAwLCAxNCAqIDYwLCAwLCAwIH0sIG5ldyBpbnRbXSB7IDIwICogNjAsIDAsIDE5ICogNjAsIDAsIDAgfSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIHBsYW4uc3R1ZGVudHMuQWRkKG5ldyBVc2VyKFwiU3R1ZGVudCAxXCIsIG5ldyBib29sW10geyB0cnVlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSB9LCBuZXcgaW50W10geyAxNSAqIDYwLCAwLCAwLCAwLCAwIH0sIG5ldyBpbnRbXSB7IDE2ICogNjAsIDAsIDAsIDAsIDAgfSkpO1xyXG4gICAgICAgICAgICAgICAgcGxhbi5zdHVkZW50cy5BZGQobmV3IFVzZXIoXCJTdHVkZW50IDJcIiwgbmV3IGJvb2xbXSB7IHRydWUsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlIH0sIG5ldyBpbnRbXSB7IDExICogNjAsIDAsIDAsIDAsIDAgfSwgbmV3IGludFtdIHsxOCAqIDYwLCAwLCAwLCAwLCAwIH0pKTtcclxuICAgICAgICAgICAgICAgIHBsYW4uc3R1ZGVudHMuQWRkKG5ldyBVc2VyKFwiU3R1ZGVudCAzXCIsIG5ldyBib29sW10geyB0cnVlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSB9LCBuZXcgaW50W10geyAxMiAqIDYwLCAwLCAwLCAwLCAwIH0sIG5ldyBpbnRbXSB7IDE0ICogNjAsIDAsIDAsIDAsIDAgfSkpO1xyXG4gICAgICAgICAgICAgICAgcGxhbi5zdHVkZW50cy5BZGQobmV3IFVzZXIoXCJTdHVkZW50IDRcIiwgbmV3IGJvb2xbXSB7IHRydWUsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlIH0sIG5ldyBpbnRbXSB7IDAsIDAsIDAsIDAsIDAgfSwgbmV3IGludFtdIHsgMjMgKiA2MCArIDU5LCAwLCAwLCAwLCAwIH0pKTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgXHJcbiAgICAgICAgICAgICAgICAvKnBsYW4udGVhY2hlcnMuQWRkKG5ldyBVc2VyKFwiVGVzdCBUZWFjaGVyXCIsIG5ldyBib29sW10geyB0cnVlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSB9LCBuZXcgaW50W10geyAxMCAqIDYwLCAwLCAwLCAwLCAwIH0sIG5ldyBpbnRbXSB7IDEyICogNjAsIDAsIDAsIDAsIDAgfSkpO1xyXG5cclxuICAgICAgICAgICAgICAgIHBsYW4uc3R1ZGVudHMuQWRkKG5ldyBVc2VyKFwiU3R1ZGVudCAyXCIsIG5ldyBib29sW10geyB0cnVlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSB9LCBuZXcgaW50W10geyAxMCAqIDYwLCAwLCAwLCAwLCAwIH0sIG5ldyBpbnRbXSB7IDEyICogNjAsIDAsIDAsIDAsIDAgfSkpO1xyXG4gICAgICAgICAgICAgICAgcGxhbi5zdHVkZW50cy5BZGQobmV3IFVzZXIoXCJTdHVkZW50IDFcIiwgbmV3IGJvb2xbXSB7IHRydWUsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlIH0sIG5ldyBpbnRbXSB7IDEwICogNjAgKyAxMCwgMCwgMCwgMCwgMCB9LCBuZXcgaW50W10geyAxMSAqIDYwICsgNTAsIDAsIDAsIDAsIDAgfSkpO1xyXG4gICAgICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgICAgIHBsYW4uQ2FsYygpO1xyXG4gICAgICAgICAgICAgICAgR2lkKFwib3V0cHV0XCIpLklubmVySFRNTCA9IHBsYW4uR2VuZXJhdGVIVE1MKCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIEFkZE5ld1RlYWNoZXIoSFRNTEVsZW1lbnQgc2VuZGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gR2V0IG5hbWUgaW5wdXQgYW5kIGl0J3MgdmFsdWVcclxuICAgICAgICAgICAgSFRNTElucHV0RWxlbWVudCBpbnB1dCA9IChTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50PihzZW5kZXIuUGFyZW50RWxlbWVudC5QYXJlbnRFbGVtZW50LkdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJmb3JtLWdyb3VwXCIpWzBdLkNoaWxkcmVuLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50LCBib29sPikoeCA9PiB4LklkID09IChcInRlYWNoZXItbmFtZVwiKSkpLkZpcnN0KCkgYXMgSFRNTElucHV0RWxlbWVudCk7XHJcbiAgICAgICAgICAgIHN0cmluZyBuZXdUZWFjaGVyTmFtZSA9IGlucHV0LlZhbHVlO1xyXG4gICAgICAgICAgICBpZiAobmV3VGVhY2hlck5hbWUgPT0gXCJcIilcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHBsYW4udGVhY2hlcnMuQWRkKG5ldyBVc2VyKG5ld1RlYWNoZXJOYW1lLCBuZXcgYm9vbFs1XSwgbmV3IGludFs1XSwgbmV3IGludFs1XSkpO1xyXG4gICAgICAgICAgICBIVE1MRWxlbWVudCBkaXYgPSBHaWQoXCJ0ZWFjaGVyc1wiKTtcclxuXHJcbiAgICAgICAgICAgIEhUTUxEaXZFbGVtZW50IGNhcmQgPSBuZXcgSFRNTERpdkVsZW1lbnQoKTtcclxuICAgICAgICAgICAgY2FyZC5DbGFzc05hbWUgPSBcImNhcmQgY2FyZC1ib2R5XCI7XHJcbiAgICAgICAgICAgIGNhcmQuSW5uZXJIVE1MICs9IFwiPHA+PHN0cm9uZz5cIiArIG5ld1RlYWNoZXJOYW1lICsgXCI8L3N0cm9uZz48L3A+XCI7XHJcbiAgICAgICAgICAgIEhUTUxCdXR0b25FbGVtZW50IHNldEhvdXJzID0gbmV3IEhUTUxCdXR0b25FbGVtZW50KCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLk5hbWUgPSAocGxhbi50ZWFjaGVycy5Db3VudCAtIDEpLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLkNsYXNzTmFtZSA9IFwiYnRuIGJ0bi1wcmltYXJ5IHRlYWNoZXItY2xpY2tcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10b2dnbGVcIiwgXCJtb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10YXJnZXRcIiwgXCIjc2V0SG91cnNNb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuSW5uZXJIVE1MID0gXCJOYXN0YXZpdCBob2RpbnlcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuT25DbGljayArPSAoZSkgPT4geyBFZGl0SG91cnNDbGljayhzZXRIb3VycywgdHJ1ZSk7IH07XHJcbiAgICAgICAgICAgIGNhcmQuQXBwZW5kQ2hpbGQoc2V0SG91cnMpO1xyXG4gICAgICAgICAgICBkaXYuQXBwZW5kQ2hpbGQoY2FyZCk7XHJcblxyXG4gICAgICAgICAgICBpbnB1dC5WYWx1ZSA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICAvLyBBbGxvdyBvbmx5IG9uZSB0ZWFjaGVyXHJcbiAgICAgICAgICAgIEdpZChcImFkZC1uZXctdGVhY2hlci1tb2RhbC1idXR0b25cIikuUmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIEFkZE5ld1N0dWRlbnQoSFRNTEVsZW1lbnQgc2VuZGVyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gR2V0IG5hbWUgaW5wdXQgYW5kIGl0J3MgdmFsdWVcclxuICAgICAgICAgICAgSFRNTElucHV0RWxlbWVudCBpbnB1dCA9IChTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50PihzZW5kZXIuUGFyZW50RWxlbWVudC5QYXJlbnRFbGVtZW50LkdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJmb3JtLWdyb3VwXCIpWzBdLkNoaWxkcmVuLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50LCBib29sPikoeCA9PiB4LklkID09IChcInN0dWRlbnQtbmFtZVwiKSkpLkZpcnN0KCkgYXMgSFRNTElucHV0RWxlbWVudCk7XHJcbiAgICAgICAgICAgIHN0cmluZyBuZXdTdHVkZW50TmFtZSA9IGlucHV0LlZhbHVlO1xyXG4gICAgICAgICAgICBpZiAobmV3U3R1ZGVudE5hbWUgPT0gXCJcIilcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIHBsYW4uc3R1ZGVudHMuQWRkKG5ldyBVc2VyKG5ld1N0dWRlbnROYW1lLCBuZXcgYm9vbFs1XSwgbmV3IGludFs1XSwgbmV3IGludFs1XSkpO1xyXG4gICAgICAgICAgICBIVE1MRWxlbWVudCBkaXYgPSBHaWQoXCJzdHVkZW50c1wiKTtcclxuXHJcbiAgICAgICAgICAgIEhUTUxEaXZFbGVtZW50IGNhcmQgPSBuZXcgSFRNTERpdkVsZW1lbnQoKTtcclxuICAgICAgICAgICAgY2FyZC5DbGFzc05hbWUgPSBcImNhcmQgY2FyZC1ib2R5XCI7XHJcbiAgICAgICAgICAgIGNhcmQuSW5uZXJIVE1MICs9IFwiPHA+PHN0cm9uZz5cIiArIG5ld1N0dWRlbnROYW1lICsgXCI8L3N0cm9uZz48L3A+XCI7XHJcbiAgICAgICAgICAgIEhUTUxCdXR0b25FbGVtZW50IHNldEhvdXJzID0gbmV3IEhUTUxCdXR0b25FbGVtZW50KCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLk5hbWUgPSAocGxhbi5zdHVkZW50cy5Db3VudCAtIDEpLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHNldEhvdXJzLkNsYXNzTmFtZSA9IFwiYnRuIGJ0bi1wcmltYXJ5IHRlYWNoZXItY2xpY2tcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10b2dnbGVcIiwgXCJtb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuU2V0QXR0cmlidXRlKFwiZGF0YS10YXJnZXRcIiwgXCIjc2V0SG91cnNNb2RhbFwiKTtcclxuICAgICAgICAgICAgc2V0SG91cnMuSW5uZXJIVE1MID0gXCJOYXN0YXZpdCBob2RpbnlcIjtcclxuICAgICAgICAgICAgc2V0SG91cnMuT25DbGljayArPSAoZSkgPT4geyBFZGl0SG91cnNDbGljayhzZXRIb3VycywgZmFsc2UpOyB9O1xyXG4gICAgICAgICAgICBjYXJkLkFwcGVuZENoaWxkKHNldEhvdXJzKTtcclxuICAgICAgICAgICAgZGl2LkFwcGVuZENoaWxkKGNhcmQpO1xyXG5cclxuICAgICAgICAgICAgaW5wdXQuVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgdm9pZCBFZGl0SG91cnNDbGljayhvYmplY3Qgc2VuZGVyLCBib29sIHdhc1RlYWNoZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBsYXN0U2V0V2FzVGVhY2hlciA9IHdhc1RlYWNoZXI7XHJcbiAgICAgICAgICAgIGxhc3RTZXRJZCA9IGludC5QYXJzZSgoc2VuZGVyIGFzIEhUTUxFbGVtZW50KS5HZXRBdHRyaWJ1dGUoXCJuYW1lXCIpKTtcclxuICAgICAgICAgICAgTGlzdDxVc2VyPiBzZWxlY3RlZENvbGxlY3Rpb24gPSAod2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzKTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLW1vbmRheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDApO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS10dWVzZGF5XCIpLklubmVySFRNTCA9IHNlbGVjdGVkQ29sbGVjdGlvbltsYXN0U2V0SWRdLkdldEhvdXJzSW5EYXkoMSk7XHJcbiAgICAgICAgICAgIEdpZChcInNldC10aW1lLXdlZG5lc2RheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDIpO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS10aHVyc2RheVwiKS5Jbm5lckhUTUwgPSBzZWxlY3RlZENvbGxlY3Rpb25bbGFzdFNldElkXS5HZXRIb3Vyc0luRGF5KDMpO1xyXG4gICAgICAgICAgICBHaWQoXCJzZXQtdGltZS1mcmlkYXlcIikuSW5uZXJIVE1MID0gc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0uR2V0SG91cnNJbkRheSg0KTtcclxuXHJcbiAgICAgICAgICAgIEdpZChcInNldFRpbWVNb2RhbEluZm9UZXh0XCIpLklubmVySFRNTCA9IFwiViB0ZW50byBkZW4gbcOhIFwiICsgc2VsZWN0ZWRDb2xsZWN0aW9uW2xhc3RTZXRJZF0ubmFtZSArIFwiIMSNYXNcIjtcclxuXHJcbiAgICAgICAgICAgIFVwZGF0ZUxpc3RPZkRheXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgU29tZURheUVkaXRIb3Vyc0NsaWNrKG9iamVjdCBzZW5kZXIpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBkYXlJZCA9IGludC5QYXJzZSgoc2VuZGVyIGFzIEhUTUxFbGVtZW50KS5HZXRBdHRyaWJ1dGUoXCJuYW1lXCIpKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBnZXRUaW1lRnJvbUhIID0gR2lkKFwiZ2V0LXRpbWUtZnJvbS1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xyXG4gICAgICAgICAgICB2YXIgZ2V0VGltZUZyb21NTSA9IEdpZChcImdldC10aW1lLWZyb20tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICAgICAgdmFyIGdldFRpbWVUb0hIID0gR2lkKFwiZ2V0LXRpbWUtdG8taGhcIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuICAgICAgICAgICAgdmFyIGdldFRpbWVUb01NID0gR2lkKFwiZ2V0LXRpbWUtdG8tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudDtcclxuXHJcbiAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gbGFzdFNldFdhc1RlYWNoZXIgPyBwbGFuLnRlYWNoZXJzIDogcGxhbi5zdHVkZW50cztcclxuXHJcbiAgICAgICAgICAgIHZhciB1c3IgPSBjb2xsZWN0aW9uW2xhc3RTZXRJZF07XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHVzci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gPiAwKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgaG91cnNGcm9tID0gKGludClNYXRoLkZsb29yKHVzci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gLyA2MGQpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZUZyb21ISC5WYWx1ZSA9IGhvdXJzRnJvbS5Ub1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZUZyb21NTS5WYWx1ZSA9ICh1c3IubWludXRlc0Zyb21BdmFpbGFibGVbZGF5SWRdIC0gaG91cnNGcm9tICogNjApLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lRnJvbUhILlZhbHVlID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGdldFRpbWVGcm9tTU0uVmFsdWUgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHVzci5taW51dGVzVG9BdmFpbGFibGVbZGF5SWRdID4gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaW50IGhvdXJzVG8gPSAoaW50KU1hdGguRmxvb3IodXNyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXlJZF0gLyA2MGQpO1xyXG4gICAgICAgICAgICAgICAgZ2V0VGltZVRvSEguVmFsdWUgPSBob3Vyc1RvLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9NTS5WYWx1ZSA9ICh1c3IubWludXRlc1RvQXZhaWxhYmxlW2RheUlkXSAtIGhvdXJzVG8gKiA2MGQpLlRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9ISC5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBnZXRUaW1lVG9NTS5WYWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgU2F2ZUhvdXJDaGFuZ2UoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdHJ5XHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gbGFzdFNldFdhc1RlYWNoZXIgPyBwbGFuLnRlYWNoZXJzIDogcGxhbi5zdHVkZW50cztcclxuXHJcbiAgICAgICAgICAgICAgICBpbnQgZnJvbSA9IChpbnQpKGludC5QYXJzZSgoR2lkKFwiZ2V0LXRpbWUtZnJvbS1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZSkgKiA2MCArIGludC5QYXJzZSgoR2lkKFwiZ2V0LXRpbWUtZnJvbS1tbVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZSkpO1xyXG4gICAgICAgICAgICAgICAgaW50IHRvID0gKGludCkoaW50LlBhcnNlKChHaWQoXCJnZXQtdGltZS10by1oaFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5WYWx1ZSkgKiA2MCArIGludC5QYXJzZSgoR2lkKFwiZ2V0LXRpbWUtdG8tbW1cIikgYXMgSFRNTElucHV0RWxlbWVudCkuVmFsdWUpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZnJvbSArIFBsYW4ubGVzc29uTGVuZ3RoID4gdG8pXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgUmVtb3ZlSG91ckluRGF5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gPSBmcm9tO1xyXG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXlJZF0gPSB0bztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCB7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHZvaWQgUmVtb3ZlSG91ckluRGF5KClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gbGFzdFNldFdhc1RlYWNoZXIgPyBwbGFuLnRlYWNoZXJzIDogcGxhbi5zdHVkZW50cztcclxuXHJcbiAgICAgICAgICAgIGNvbGxlY3Rpb25bbGFzdFNldElkXS5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJZF0gPSAwO1xyXG4gICAgICAgICAgICBjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc1RvQXZhaWxhYmxlW2RheUlkXSA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyB2b2lkIFVwZGF0ZUxpc3RPZkRheXMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBsYXN0U2V0V2FzVGVhY2hlciA/IHBsYW4udGVhY2hlcnMgOiBwbGFuLnN0dWRlbnRzO1xyXG5cclxuICAgICAgICAgICAgLy8gU2V0IHRvIGFsbCBkYXlzOiBpZiB0aGVyZSBpcyBhdCBsZWFzdCB7UGxhbi5sZXNzb25MZW5ndGh9ICg1MCkgbWludXRlcyBiZXR3ZWVuIHR3byB0aW1lczogcmV0dXJuIHRpbWVzIGluIGZvcm1hdCBbXCJISDpNTSAtIEhIOk1NXCJdLCBlbHNlLCByZXR1cm4gXCJOZW7DrSBuYXN0YXZlbm9cIlxyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IDU7IGkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgR2lkKFwic2V0LXRpbWUtXCIgKyBkYXlzW2ldKS5Jbm5lckhUTUwgPSBjb2xsZWN0aW9uW2xhc3RTZXRJZF0ubWludXRlc1RvQXZhaWxhYmxlW2ldIC0gY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2ldIDwgUGxhbi5sZXNzb25MZW5ndGggPyBcIk5lbsOtIG5hc3RhdmVub1wiIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNaW51dGVzVG9Ib3Vyc0FuZE1pbnV0ZXMoY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2ldKSArIFwiIC0gXCIgKyBNaW51dGVzVG9Ib3Vyc0FuZE1pbnV0ZXMoY29sbGVjdGlvbltsYXN0U2V0SWRdLm1pbnV0ZXNUb0F2YWlsYWJsZVtpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgc3RyaW5nIE1pbnV0ZXNUb0hvdXJzQW5kTWludXRlcyhpbnQgbWludXRlcylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludCBob3VycyA9IChpbnQpTWF0aC5GbG9vcihtaW51dGVzIC8gNjBkKTtcclxuICAgICAgICAgICAgcmV0dXJuIGhvdXJzLlRvU3RyaW5nKFwiMDBcIikgKyBcIjpcIiArIChtaW51dGVzIC0gaG91cnMgKiA2MCkuVG9TdHJpbmcoXCIwMFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIHN0cmluZyBNeU51bWJlclRvU3RyaW5nV2l0aEF0TGVhc3RUd29EaWdpdHNGb3JtYXQoaW50IG51bWJlcilcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0cmluZyBudW0gPSBudW1iZXIuVG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgaWYgKG51bS5MZW5ndGggPT0gMSlcclxuICAgICAgICAgICAgICAgIG51bSA9IFwiMFwiICsgbnVtO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVtO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgSFRNTEVsZW1lbnQgR2lkKHN0cmluZyBpZCkge3JldHVybiBEb2N1bWVudC5HZXRFbGVtZW50QnlJZChpZCk7fVxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIEhUTUxFbGVtZW50W10gR2NsKHN0cmluZyBjbHMpIHtyZXR1cm4gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5Ub0FycmF5PGdsb2JhbDo6QnJpZGdlLkh0bWw1LkhUTUxFbGVtZW50PihEb2N1bWVudC5Cb2R5LkdldEVsZW1lbnRzQnlDbGFzc05hbWUoY2xzKSk7fVxyXG4gICAgfVxyXG59IiwidXNpbmcgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdztcclxudXNpbmcgU3lzdGVtO1xyXG51c2luZyBTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYztcclxudXNpbmcgU3lzdGVtLkxpbnE7XHJcbnVzaW5nIFN5c3RlbS5UZXh0O1xyXG51c2luZyBTeXN0ZW0uVGhyZWFkaW5nLlRhc2tzO1xyXG5cclxubmFtZXNwYWNlIFN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWNcclxue1xyXG4gICAgcHVibGljIGNsYXNzIFBsYW5cclxuICAgIHtcclxuICAgICAgICBwdWJsaWMgY29uc3QgaW50IGxlc3Nvbkxlbmd0aCA9IDUwOyAvLyA0NSArIDUgcGF1c2VcclxuICAgICAgICBwcml2YXRlIGNvbnN0IGludCBicmVha0FmdGVyTGVzc29ucyA9IDM7IC8vIEJyZWFrIGFmdGVyIDMgbGVzc29uc1xyXG4gICAgICAgIHB1YmxpYyBjb25zdCBpbnQgYnJlYWtBZnRlckxlc3NvbnNMZW5ndGggPSAxNTtcclxuICAgICAgICBwcml2YXRlIGludFtdIGJyZWFrQWZ0ZXJMZXNzb25zU3RhcnQgPSBuZXcgaW50W10geyBpbnQuTWF4VmFsdWUsIGludC5NYXhWYWx1ZSwgaW50Lk1heFZhbHVlLCBpbnQuTWF4VmFsdWUsIGludC5NYXhWYWx1ZSB9O1xyXG5cclxuICAgICAgICBwdWJsaWMgTGlzdDxVc2VyPiBzdHVkZW50cztcclxuICAgICAgICBwdWJsaWMgTGlzdDxVc2VyPiB0ZWFjaGVycztcclxuXHJcbiAgICAgICAgcHVibGljIFBsYW4oKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgc3R1ZGVudHMgPSBuZXcgTGlzdDxVc2VyPigpO1xyXG4gICAgICAgICAgICB0ZWFjaGVycyA9IG5ldyBMaXN0PFVzZXI+KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RyaW5nIEdlbmVyYXRlSFRNTCgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHJpbmcgcyA9IFwiXCI7XHJcblxyXG4gICAgICAgICAgICB2YXIgbm90UG9zU3R1ZGVudHMgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4gIXguYXNzaWduZWQpKTtcclxuICAgICAgICAgICAgdmFyIHBvc1N0dWRlbnRzID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KSh4ID0+IHguYXNzaWduZWQpKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChub3RQb3NTdHVkZW50cy5Db3VudCgpID4gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgcyArPSBzdHJpbmcuRm9ybWF0KFwiPGRpdiBjbGFzcz1cXFwiYWxlcnQgYWxlcnQtZGFuZ2VyIGFsZXJ0LWRpc21pc3NpYmxlIGZhZGUgc2hvd1xcXCJyb2xlPVxcXCJhbGVydFxcXCJcIikrXHJcbnN0cmluZy5Gb3JtYXQoXCI8cD5OZXBvZGHFmWlsbyBzZSBuYWrDrXQgbcOtc3RvIHBybyB7MH0geiB7MX0gxb7DoWvFryBcIixub3RQb3NTdHVkZW50cy5Db3VudCgpLHN0dWRlbnRzLkNvdW50KStcclxuc3RyaW5nLkZvcm1hdChcIih7MH0pPC9wPlwiLFN0cmluZy5Kb2luKFwiLCBcIiwgbm90UG9zU3R1ZGVudHMuU2VsZWN0PHN0cmluZz4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIHN0cmluZz4pKHggPT4geC5uYW1lKSkuVG9BcnJheSgpKSkrXHJcbnN0cmluZy5Gb3JtYXQoXCI8YnV0dG9uIHR5cGU9XFxcImJ1dHRvblxcXCIgY2xhc3M9XFxcImNsb3NlXFxcIiBkYXRhLWRpc21pc3M9XFxcImFsZXJ0XFxcIiBhcmlhLWxhYmVsPVxcXCJDbG9zZVxcXCI+XCIpK1xyXG5zdHJpbmcuRm9ybWF0KFwiPHNwYW4gYXJpYS1oaWRkZW49XFxcInRydWVcXFwiPsOXPC9zcGFuPjwvYnV0dG9uPjwvZGl2PlwiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3RyaW5nW10gZGF5cyA9IHsgXCJQb25kxJtsw61cIiwgXCLDmnRlcsO9XCIsIFwiU3TFmWVkYVwiLCBcIsSMdHZydGVrXCIsIFwiUMOhdGVrXCIgfTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoaW50IGRheSA9IDA7IGRheSA8IDU7IGRheSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpbnQgcG9zc2VkU3R1ZGVudHNUb2RheSA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgcyArPSBzdHJpbmcuRm9ybWF0KFwiPGRpdiBjbGFzcz1cXFwicm93XFxcIj48ZGl2IGNsYXNzPVxcXCJjYXJkIGNhcmQtYm9keVxcXCI+PGgzPnswfTwvaDM+XCIsZGF5c1tkYXldKTtcclxuICAgICAgICAgICAgICAgIC8vIDxkaXYgY2xhc3M9XCJjYXJkIGNhcmQtYm9keVwiPlBldHIgKDEwOjAwIC0gMTA6NTApPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHBzc2RheSA9IHBvc1N0dWRlbnRzLldoZXJlKChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4LmFzc2lnbmVkRGF5ID09IGRheSkpLk9yZGVyQnk8aW50PigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgaW50PikoeCA9PiB4LmFzc2lnbmVkTWludXRlcykpLlRvQXJyYXkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocHNzZGF5Lkxlbmd0aCA9PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gXCI8aT5OYSB0ZW50byBkZW4gbmVuw60gbmljIG5hcGzDoW5vdmFuw6lobzwvaT5cIjtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHBzc2RheS5MZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBVc2VyIGN1cnJlbnQgPSBwc3NkYXlbaV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEluc2VydCBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3NzZWRTdHVkZW50c1RvZGF5ID09IGJyZWFrQWZ0ZXJMZXNzb25zICYmIGJyZWFrQWZ0ZXJMZXNzb25zU3RhcnRbZGF5XSAhPSBpbnQuTWF4VmFsdWUpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnQgYnJlYWtGcm9tID0gKGludClNYXRoLkZsb29yKGJyZWFrQWZ0ZXJMZXNzb25zU3RhcnRbZGF5XSAvIDYwZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGludCBicmVha1RvID0gKGludClNYXRoLkZsb29yKChicmVha0FmdGVyTGVzc29uc1N0YXJ0W2RheV0gKyBicmVha0FmdGVyTGVzc29uc0xlbmd0aCkgLyA2MGQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nIEJyZWFrSEZyb20gPSBicmVha0Zyb20uVG9TdHJpbmcoXCIwMFwiKSArIFwiOlwiICsgKGJyZWFrQWZ0ZXJMZXNzb25zU3RhcnRbZGF5XSAtIGJyZWFrRnJvbSAqIDYwKS5Ub1N0cmluZyhcIjAwXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmcgQnJlYWtIVG8gPSBicmVha1RvLlRvU3RyaW5nKFwiMDBcIikgKyBcIjpcIiArIChicmVha0FmdGVyTGVzc29uc1N0YXJ0W2RheV0gKyBicmVha0FmdGVyTGVzc29uc0xlbmd0aCAtIGJyZWFrVG8gKiA2MCkuVG9TdHJpbmcoXCIwMFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gc3RyaW5nLkZvcm1hdChcIjxkaXYgY2xhc3M9XFxcImNhcmQgY2FyZC1ib2R5XFxcIiBzdHlsZT1cXFwiZGlzcGxheTogaW5saW5lO1xcXCI+PHNwYW4gc3R5bGU9XFxcImZvbnQtc3R5bGU6IGl0YWxpYztcXFwiPlDFmWVzdMOhdmthPC9zcGFuPiAoezB9IC0gezF9KTwvZGl2PlwiLEJyZWFrSEZyb20sQnJlYWtIVG8pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAgICAgICAgICAgICBpbnQgaG91cnNGcm9tID0gKGludClNYXRoLkZsb29yKGN1cnJlbnQuYXNzaWduZWRNaW51dGVzIC8gNjBkKTtcclxuICAgICAgICAgICAgICAgICAgICBpbnQgaG91cnNUbyA9IChpbnQpTWF0aC5GbG9vcigoY3VycmVudC5hc3NpZ25lZE1pbnV0ZXMgKyBsZXNzb25MZW5ndGgpIC8gNjBkKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc3RyaW5nIGhGcm9tID0gaG91cnNGcm9tLlRvU3RyaW5nKFwiMDBcIikgKyBcIjpcIiArIChjdXJyZW50LmFzc2lnbmVkTWludXRlcyAtIGhvdXJzRnJvbSAqIDYwKS5Ub1N0cmluZyhcIjAwXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0cmluZyBoVG8gPSBob3Vyc1RvLlRvU3RyaW5nKFwiMDBcIikgKyBcIjpcIiArIChjdXJyZW50LmFzc2lnbmVkTWludXRlcyArIGxlc3Nvbkxlbmd0aCAtIGhvdXJzVG8gKiA2MCkuVG9TdHJpbmcoXCIwMFwiKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcyArPSBzdHJpbmcuRm9ybWF0KFwiPGRpdiBjbGFzcz1cXFwiY2FyZCBjYXJkLWJvZHlcXFwiPnswfSAoXCIsY3VycmVudC5uYW1lKStcclxuc3RyaW5nLkZvcm1hdChcInswfSAtIHsxfSk8L2Rpdj5cIixoRnJvbSxoVG8pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBwb3NzZWRTdHVkZW50c1RvZGF5Kys7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcyArPSBcIjwvZGl2PjwvZGl2PlwiO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE5PVEU6IEkgYXNzdW1lIHRoZXJlIGlzIG9ubHkgb25lIHRlYWNoZXJcclxuICAgICAgICBwdWJsaWMgdm9pZCBDYWxjKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGRheSA9IDA7IGRheSA8IDU7IGRheSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChVc2VyIHRlYWNoZXIgaW4gdGVhY2hlcnMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRlYWNoZXIubWludXRlc1RvQXZhaWxhYmxlW2RheV0gLSB0ZWFjaGVyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gPj0gbGVzc29uTGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZWFjaGVyLmRheXNBdmFpbGFibGVbZGF5XSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoVXNlciBzdHVkZW50IGluIHN0dWRlbnRzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdHVkZW50Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0gc3R1ZGVudC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldID49IGxlc3Nvbkxlbmd0aClcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudC5kYXlzQXZhaWxhYmxlW2RheV0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuXHJcbiAgICAgICAgICAgIC8vIEhPVyBUSElTIFdPUktTOlxyXG5cclxuXHJcbiAgICAgICAgICAgIC8vIDEuMCkgU2V0IHN0YXJ0IHRpbWUgYXMgdGVhY2hlcidzIHN0YXJ0IHRpbWUgb2YgdGhlIGRheVxyXG4gICAgICAgICAgICAvLyAxLjEpIEZpbmQgc3R1ZGVudCB3aG8gaGFzIHN0YXJ0aW5nIHRpbWUgdGhlIHNhbWUgYXMgdGVhY2hlcidzIHN0YXJ0IHRpbWUuIElmIHllcywgcG9zIGFuZCByZXBlYXQgMSkgNDUgbWludXRlcyBsYXRlci5cclxuICAgICAgICAgICAgLy8gICAgICBJZiBub3QsIG1vdmUgYnkgNSBtaW51dGVzIGFuZCB0cnkgaXQgYWdhaW4gd2l0aCBhbGwgc3R1ZGVudHMuIElmIGhpdCB0ZWFjaGVyJ3MgZW5kIHRpbWUsIG1vdmUgdG8gbmV4dCBkYXlcclxuXHJcbiAgICAgICAgICAgIC8vIE9QVElNQUxJWkFUSU9OOiBDaGVjayBpZiBib3RoIHRlYWNoZXIgYW5kIHN0dWRlbnRzIGhhdmUgc29tZSBtaW51dGVzIGluIGNvbW1vbi4gSWYgbm90LCBza2lwIHRoaXMgZGF5XHJcblxyXG5cclxuXHJcblxyXG4gICAgICAgICAgICAvLyBJZiBhbGwgc3R1ZGVudHMgYXJlIHBvc2l0aW9uZWQsIGVuZC4gSWYgbm90LCBoZWFkIHRvIHN0ZXAgMlxyXG5cclxuICAgICAgICAgICAgLy8gMi4wKSBJIGhhdmUgc29tZSBzdHVkZW50cyB3aXRob3V0IGFzc2lnbmVkIGhvdXJzLiBQaWNrIHN0dWRlbnQgd2l0aCBsZWFzdCBwb3NzaWJsZSBob3Vycy4gRmluZCBhbGxcclxuICAgICAgICAgICAgLy8gICAgICBob3VycyB3aGVyZSBJIGNhbiBwb3MgdGhpcyBzdHVkZW50IGluIGFsbCBkYXlzLlxyXG4gICAgICAgICAgICAvLyAyLjEpIENob29zZSB0aGUgcG9zaXRpb24gd2hlcmUgdGhlIGxlYXN0IHVuYXNzaWduZWQgc3R1ZGVudHMgY2FuIGdvLiBBZnRlciB0aGF0LCBjaG9vc2UgcG9zaXRpb24gd2hlcmVcclxuICAgICAgICAgICAgLy8gICAgICBpcyBzdHVkZW50IHdpdGggbW9zdCBmcmVlIHRpbWVcclxuICAgICAgICAgICAgLy8gMi4yKSBTd2FwIHRob3NlIHN0dWRlbnRzXHJcbiAgICAgICAgICAgIC8vIDIuMykgUmVwZWF0LiBJZiBhbHJlYWR5IHJlcGVhdGVkIE4gdGltZXMsIHdoZXJlIE4gaXMgbnVtYmVyIG9mIHVuYXNzaWduZWQgc3R1ZGVudHMgYXQgdGhlIGJlZ2dpbmluZyBvZiBwaGFzZSAyLFxyXG4gICAgICAgICAgICAvLyAgICAgIGVuZCwgc2hvdyBhbGwgcG9zaXRpb25lZCBzdHVkZW50cyBhbmQgcmVwb3J0IGZhaWx1cmVcclxuXHJcblxyXG5cclxuICAgICAgICAgICAgaWYgKHRlYWNoZXJzLkNvdW50ICE9IDEgfHwgc3R1ZGVudHMuQ291bnQgPT0gMClcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlc2V0IHByZXZpb3VzIGNhbGN1bGF0aW9uc1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHN0dWRlbnRzLkNvdW50OyBpKyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHN0dWRlbnRzW2ldLmFzc2lnbmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBzdHVkZW50c1tpXS5hc3NpZ25lZERheSA9IC0xO1xyXG4gICAgICAgICAgICAgICAgc3R1ZGVudHNbaV0uYXNzaWduZWRNaW51dGVzID0gLTE7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEZpcnN0IHN0YWdlXHJcbiAgICAgICAgICAgIC8vVHJ5VG9Qb3NBbGxTdHVkZW50c1ZlcjIoKTtcclxuICAgICAgICAgICAgLy8gU2Vjb25kIHN0YWdlXHJcbiAgICAgICAgICAgIC8vUG9zTm90UG9zc2VkU3R1ZGVudHMoKTtcclxuXHJcblxyXG5cclxuICAgICAgICAgICAgLy8gT1IgSSBjb3VsZCBkbyBpdCB0aGlzIHdheTpcclxuXHJcbiAgICAgICAgICAgIC8vIDEgICAgICAgICAgICBGb3IgYWxsIGRheXMgd2hlcmUgYXQgbGVhc3QgMSB0ZWFjaGVyICsgMSBzdHVkZW50IGhhcyB0aW1lIGFuZCBzb21lb25lIGlzIG5vdCBhc3NpZ25lZCB5ZXRcclxuICAgICAgICAgICAgLy8gMS4xICAgICAgICAgIFBvcyAzIHN0dWRlbnRzIHRoaXMgd2F5OiBQb3Mgc3R1ZGVudCB0aGF0IGNhbiBiZSB0aGVyZSB0aGUgZWFybGllc3QgdGltZS4gSWYgdGhlcmUgaXMgc29tZW9uZSwgdGhhdCBjYW4gYmUgdGhlcmVcclxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgIDw1MCBtaW51dGVzIGFmdGVyIHRoZSBzdHVkZW50IGFuZCBoYXMgbGVzcyB0aW1lLCBwbGFjZSBoaW0gaW5zdGVhZFxyXG4gICAgICAgICAgICAvLyAxLjIgICAgICAgICAgUGxhY2UgYSBicmVha1xyXG4gICAgICAgICAgICAvLyAxLjMgICAgICAgICAgUGxhY2UgYXMgbWFueSBzdHVkZW50cyBhcyB5b3UgY2FuXHJcblxyXG4gICAgICAgICAgICAvLyAyICAgICAgICAgICAgRm9yIGFsbCB1bmFzc2lnbmVkIHN0dWRlbnRzOlxyXG4gICAgICAgICAgICAvLyAyLjEgICAgICAgICAgR2V0IGFsbCBzdHVkZW50cyB0aGF0IGFyZSBibG9ja2luZyBoaW0uIERvIHRoaXMgZm9yIGFsbCAob3JkZXJlZCBieSBudW1iZXIgb2YgdGltZSkgb2YgdGhlbSB1bmxlc3MgdGhlIHN0dWRlbnQgaXMgcG9zc2VkOlxyXG4gICAgICAgICAgICAvLyAyLjEuMSAgICAgICAgU3dhcCB0aGVzZSBzdHVkZW50cy4gUmVtZW1iZXIgdG8gbW92ZSBvdGhlciBzdHVkZW50cyBiZWhpbmQgaGltIGlmIG5lY2Nlc3NhcnkuIEJlIGNhcmVmdWwgaWYgc29tZW9uZSBsb3NlcyBwb3NpdGlvbiBiZWNhdXNlIG9mIHRoaXNcclxuICAgICAgICAgICAgLy8gMi4xLjIgICAgICAgIElmIHRoZXNlIHN3YXBwZWQgc3R1ZGVudHMgKHRoYXQgZG9uJ3QgaGF2ZSB0aW1lIG5vdykgZG9uJ3QgaGF2ZSBbZGlyZWN0XSBwbGFjZSB0byBzdGF5LCByZXZlcnQgY2hhbmdlc1xyXG4gICAgICAgICAgICAvLyAyLjEuMyAgICAgICAgRWxzZSwgcGxhY2Ugc3R1ZGVudHMgdGhlcmUgYW5kIGdvIGJhY2sgdG8gWzJdXHJcblxyXG5cclxuICAgICAgICAgICAgLy9Qb3NTdHVkZW50cygpO1xyXG4gICAgICAgICAgICAvL0lEb250Q2FyZUp1c3RQb3NzU3R1ZGVudHMoKTsgLy8gVEhJUyBXQVNOVCBDT01NRU5URURcclxuXHJcblxyXG5cclxuXHJcblxyXG5cclxuICAgICAgICAgICAgLy8gVVNJTkcgRkxPV1M6XHJcblxyXG4gICAgICAgICAgICB0cnlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgRG9JdFVzaW5nRmxvd3MoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoRXhjZXB0aW9uIGV4KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBCcmlkZ2UuU2NyaXB0LkNhbGwoXCJjb25zb2xlLmxvZ1wiLCBleCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBUcnlUb1Bvc0FsbFN0dWRlbnRzVmVyMigpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBVc2VyIHRlYWNoZXIgPSB0ZWFjaGVyc1swXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoaW50IGRheSA9IDA7IGRheSA8IDU7IGRheSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGVhY2hlci5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHRlYWNoZXIubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA8IGxlc3Nvbkxlbmd0aClcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgc3R1ZGVudHNUb2RheSA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiAheC5hc3NpZ25lZCAmJiB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0geC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldID49IGxlc3Nvbkxlbmd0aCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLk9yZGVyQnk8aW50PigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgaW50PikoeCA9PiB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0geC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldKSkuVG9BcnJheSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGludCBwb3NzZWRIb3VycyA9IDA7XHJcbiAgICAgICAgICAgICAgICBpbnQgbWludXRlQnJlYWsgPSAtMTtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHN0dWRlbnRzVG9kYXkuTGVuZ3RoOyBpKyspXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETzogTXV6ZSBzZSBzdGF0LCB6ZSB0ZW4gc3R1ZGVudCBzIG5lam1pbiB2ZWxueWhvIGNhc3UgYnVkZSBtZXJtb21vY2kgdmVwcmVkdSBhIGJ1ZGUgYmxva292YXQgbWlzdG8gcHJvIGppbnlobywgaSBrZHl6IGJ5IHNlXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdiBwb2hvZGUgdmVzZWwgamVzdGUgZG96YWR1LiBUcmViYSBBIG1hIG1pbiBjYXN1IG5leiBCLiBBOiAxMjozMC0xNTowMCwgQjogMTI6MDAtMTc6MDAsIHZ5c2xlZGVrIGJ1ZGVcclxuICAgICAgICAgICAgICAgICAgICAvLyBBOiAxMjozMC0xMzoyMCwgQjogMTM6MjAtMTQ6MTAgTUlTVE8gQiA6MTI6MDAgLSAxMjo1MCwgQTogMTI6NTAtMTM6NDBcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpbnQgbWludXRlID0gc3R1ZGVudHNUb2RheVtpXS5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldOyBtaW51dGUgPD0gc3R1ZGVudHNUb2RheVtpXS5taW51dGVzVG9BdmFpbGFibGVbZGF5XTsgbWludXRlICs9IDUpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGVhY2hlci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldID4gbWludXRlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW51dGUgPSB0ZWFjaGVyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0gLSA1O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0ZWFjaGVyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIDwgbWludXRlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWludXRlID49IG1pbnV0ZUJyZWFrICYmIG1pbnV0ZSA8PSBtaW51dGVCcmVhayArIGJyZWFrQWZ0ZXJMZXNzb25zTGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3R1ZGVudHNJblRoaXNUaW1lRnJhbWUgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50c1RvZGF5LChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4LmFzc2lnbmVkICYmIHguYXNzaWduZWREYXkgPT0gZGF5ICYmIHguYXNzaWduZWRNaW51dGVzID49IG1pbnV0ZSAtIGxlc3Nvbkxlbmd0aCAmJiB4LmFzc2lnbmVkTWludXRlcyA8PSBtaW51dGUgKyBsZXNzb25MZW5ndGgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdHVkZW50c0luVGhpc1RpbWVGcmFtZS5Db3VudCgpID4gMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zc2VkSG91cnMrKztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzVG9kYXlbaV0uYXNzaWduZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50c1RvZGF5W2ldLmFzc2lnbmVkRGF5ID0gZGF5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50c1RvZGF5W2ldLmFzc2lnbmVkTWludXRlcyA9IG1pbnV0ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb3NzZWRIb3VycyA9PSBicmVha0FmdGVyTGVzc29ucylcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zc2VkSG91cnMgPSBpbnQuTWluVmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShTdHJpbmcuSm9pbihcIiwgXCIsIFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzVG9kYXksKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KSh4ID0+IHguYXNzaWduZWQpKS5PcmRlckJ5PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGludD4pKHggPT4geC5hc3NpZ25lZE1pbnV0ZXMpKS5TZWxlY3Q8c3RyaW5nPigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgc3RyaW5nPikoeCA9PiB4Lm5hbWUpKS5Ub0FycmF5KCkpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGludCBtaW51dGVPZkxhc3RQb3NzZWRTdHVkZW50VG9kYXkgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50c1RvZGF5LChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4LmFzc2lnbmVkKSkuT3JkZXJCeTxpbnQ+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBpbnQ+KSh4ID0+IHguYXNzaWduZWRNaW51dGVzKSkuVG9BcnJheSgpWzJdLmFzc2lnbmVkTWludXRlcyArIGxlc3Nvbkxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbnV0ZUJyZWFrID0gbWludXRlT2ZMYXN0UG9zc2VkU3R1ZGVudFRvZGF5O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtBZnRlckxlc3NvbnNTdGFydFtkYXldID0gbWludXRlQnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgUG9zTm90UG9zc2VkU3R1ZGVudHMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdmFyIHVucG9zc2VkU3R1ZGVudHMgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHN0dWRlbnQgPT4gIXN0dWRlbnQuYXNzaWduZWQpKS5Ub0xpc3QoKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh1bnBvc3NlZFN0dWRlbnRzLkNvdW50ID09IDApXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgICAgICBib29sIGNoYW5nZSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICB3aGlsZSAoY2hhbmdlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBjaGFuZ2UgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIC8vIFBpY2sgb25lIG9mIHVucG9zZWQgc3R1ZGVudHMgd2l0aCBsb3dlc3QgbnVtYmVyIG9mIHBvc3NpYmxlIGhvdXJzXHJcbiAgICAgICAgICAgICAgICBpbnQgbG93ZXN0U3R1ZGVudEluZGV4ID0gLTE7XHJcbiAgICAgICAgICAgICAgICBpbnQgbG93ZXN0U3R1ZGVudE1pbnV0ZXMgPSBpbnQuTWF4VmFsdWU7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHVucG9zc2VkU3R1ZGVudHMuQ291bnQ7IGkrKylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBVc2VyIHMgPSB1bnBvc3NlZFN0dWRlbnRzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBtaW51dGVzID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGludCBkYXkgPSAwOyBkYXkgPCA1OyBkYXkrKylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbnV0ZXMgKz0gcy5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHMubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1pbnV0ZXMgPCBsb3dlc3RTdHVkZW50TWludXRlcylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvd2VzdFN0dWRlbnRJbmRleCA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvd2VzdFN0dWRlbnRNaW51dGVzID0gbWludXRlcztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBVc2VyIHNlbGVjdFN0dWRlbnQgPSB1bnBvc3NlZFN0dWRlbnRzW2xvd2VzdFN0dWRlbnRJbmRleF07XHJcblxyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIFRyeVRvUG9zQWxsU3R1ZGVudHMoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gQXNzdW1pbmcgSSBoYXZlIGp1c3Qgb25lIHRlYWNoZXJcclxuICAgICAgICAgICAgVXNlciB0ZWFjaGVyID0gdGVhY2hlcnNbMF07XHJcblxyXG4gICAgICAgICAgICBmb3IgKGludCBkYXkgPSAwOyBkYXkgPCA1OyBkYXkrKylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLy8gRm9yIGFsbCBkYXlzLCBza2lwIGRheSBpZiBlaXRoZXIgYWxsIHN0dWRlbnRzIG9yIHRlYWNoZXIgYXJlIGJ1c3lcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBHZXQgYWxsIHN0dWRlbnRzIHRoYXQgaGF2ZSBhdCBsZWFzdCA1MG1pbnMgdGltZSB0b2RheSBhbmQgc3RpbGwgZG9uJ3QgaGF2ZSBhbnl0aGluZyBhc3NpZ25lZFxyXG4gICAgICAgICAgICAgICAgdmFyIHN0dWRlbnRzRm9yVGhpc0RheSA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoeCA9PiB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0geC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldID49IGxlc3Nvbkxlbmd0aCAmJiAheC5hc3NpZ25lZCkpLlRvQXJyYXkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGVhY2hlci5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHRlYWNoZXIubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA8IGxlc3Nvbkxlbmd0aCB8fCAvLyBJZiB0aGUgdGVhY2hlciBkb24ndCBoYXZlIGZ1bGwgNTAgbWludXRlcyBvZiB0aW1lXHJcbiAgICAgICAgICAgICAgICAgICBzdHVkZW50c0ZvclRoaXNEYXkuTGVuZ3RoID09IDApIC8vIE9yIGlmIHRoZXJlIGlzIG5vIHN0dWRlbnQgd2l0aCBhdCBsZWFzdCA1MCBtaW50dWVzIG9mIHRpbWVcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcblxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEdvIGZvciBhbGwgdGhlIHRlYWNoZXIncyBtaW51dGVzIHRvZGF5XHJcblxyXG4gICAgICAgICAgICAgICAgaW50IGhvdXJzRWxhcHNlZCA9IDA7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGludCBtaW51dGUgPSB0ZWFjaGVyLm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV07IG1pbnV0ZSA8PSB0ZWFjaGVyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldOyBtaW51dGUgKz0gNSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaG91cnNFbGFwc2VkID09IGJyZWFrQWZ0ZXJMZXNzb25zKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaG91cnNFbGFwc2VkID0gaW50Lk1pblZhbHVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgbWludXRlICs9IGJyZWFrQWZ0ZXJMZXNzb25zTGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHVkZW50c0luVGhpc1Rlcm0gPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50c0ZvclRoaXNEYXksKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KShzdHVkZW50ID0+IHN0dWRlbnQubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA8PSBtaW51dGUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnQubWludXRlc1RvQXZhaWxhYmxlW2RheV0gPj0gbWludXRlICsgbGVzc29uTGVuZ3RoKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5PcmRlckJ5PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGludD4pKHggPT4geC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSkpLlRvQXJyYXkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgVXNlciBjaG9zZW5TdHVkZW50ID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5GaXJzdE9yRGVmYXVsdDxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHNJblRoaXNUZXJtKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNob3NlblN0dWRlbnQgPT0gbnVsbClcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNob3NlblN0dWRlbnQuYXNzaWduZWRNaW51dGVzID0gbWludXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNob3NlblN0dWRlbnQuYXNzaWduZWREYXkgPSBkYXk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hvc2VuU3R1ZGVudC5hc3NpZ25lZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIG1pbnV0ZSArPSBsZXNzb25MZW5ndGggLSA1O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBob3Vyc0VsYXBzZWQrKztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIFBvc1N0dWRlbnRzKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGZvciAoaW50IGRheSA9IDA7IGRheSA8IDU7IGRheSsrKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyBBc3N1bWluZyBJIGhhdmUganVzdCBvbmUgdGVhY2hlclxyXG4gICAgICAgICAgICAgICAgVXNlciB0ZWFjaGVyID0gdGVhY2hlcnNbMF07XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gR2V0IGFsbCBzdHVkZW50cyB0aGF0IGhhdmUgYXQgbGVhc3QgNTBtaW5zIHRpbWUgdG9kYXkgYW5kIHN0aWxsIGRvbid0IGhhdmUgYW55dGhpbmcgYXNzaWduZWRcclxuICAgICAgICAgICAgICAgIHZhciBzdHVkZW50c0ZvclRoaXNEYXkgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4geC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA+PSBsZXNzb25MZW5ndGggJiYgIXguYXNzaWduZWQpKVxyXG4gICAgICAgICAgICAgICAgICAgIC5PcmRlckJ5PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGludD4pKHggPT4geC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSkpLlRvQXJyYXkoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGVhY2hlci5taW51dGVzVG9BdmFpbGFibGVbZGF5XSAtIHRlYWNoZXIubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA8IGxlc3Nvbkxlbmd0aCB8fCAhdGVhY2hlci5kYXlzQXZhaWxhYmxlW2RheV0gfHwgLy8gSWYgdGhlIHRlYWNoZXIgZG9uJ3QgaGF2ZSBmdWxsIDUwIG1pbnV0ZXMgb2YgdGltZVxyXG4gICAgICAgICAgICAgICAgICAgc3R1ZGVudHNGb3JUaGlzRGF5Lkxlbmd0aCA9PSAwKSAvLyBPciBpZiB0aGVyZSBpcyBubyBzdHVkZW50IHdpdGggYXQgbGVhc3QgNTAgbWludHVlcyBvZiB0aW1lXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG5cclxuICAgICAgICAgICAgICAgIGludCBwb3NzZWQgPSAwO1xyXG4gICAgICAgICAgICAgICAgLy8gR28gdGhydSBhbGwgdGVhY2hlciBob3Vyc1xyXG4gICAgICAgICAgICAgICAgZm9yIChpbnQgdGltZSA9IHRlYWNoZXIubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XTsgdGltZSA8PSB0ZWFjaGVyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0gbGVzc29uTGVuZ3RoOyB0aW1lICs9IDUpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTGV0cyB0YWtlIGEgYnJlYWtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocG9zc2VkID09IDMpXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha0FmdGVyTGVzc29uc1N0YXJ0W2RheV0gPSB0aW1lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lICs9IGJyZWFrQWZ0ZXJMZXNzb25zTGVuZ3RoIC0gNTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zc2VkKys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBzdHVkZW50IGF2YWlsYWJsZVxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHVkZW50c0F2YWlsYWJsZSA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzRm9yVGhpc0RheSwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4geC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldIDw9IHRpbWUgJiYgeC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSA+PSB0aW1lICsgbGVzc29uTGVuZ3RoKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgLk9yZGVyQnk8aW50PigoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgaW50PikoeCA9PiB4Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0pKTsgLy8gVE9ETzogS2R5eiBqc291IGR2YSBzZSBzdGVqbnltYSBob2RpbmFtYSwgdXByZWRub3N0bml0IHRvaG8sIGtkbyBtYSBtaW4gY2FzdVxyXG4gICAgICAgICAgICAgICAgICAgIENvbnNvbGUuV3JpdGVMaW5lKFN0cmluZy5Kb2luKFwiLCBcIiwgc3R1ZGVudHNBdmFpbGFibGUuU2VsZWN0PHN0cmluZz4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIHN0cmluZz4pKHggPT4geC5uYW1lICsgXCI6IFwiICsgeC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldKSkpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgVXNlciBjaG9zZW5TdHVkZW50ID0gc3R1ZGVudHNBdmFpbGFibGUuRmlyc3RPckRlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNob3NlblN0dWRlbnQgPT0gbnVsbClcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNob3NlblN0dWRlbnQuYXNzaWduZWRNaW51dGVzID0gdGltZTtcclxuICAgICAgICAgICAgICAgICAgICBjaG9zZW5TdHVkZW50LmFzc2lnbmVkRGF5ID0gZGF5O1xyXG4gICAgICAgICAgICAgICAgICAgIGNob3NlblN0dWRlbnQuYXNzaWduZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aW1lICs9IGxlc3Nvbkxlbmd0aCAtIDU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHBvc3NlZCsrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgQnJ1dGVGb3JjZVN0dWRlbnRzKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFVzZXIgdGVhY2hlciA9IHRlYWNoZXJzWzBdO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpbnQgZGF5ID0gMDsgZGF5IDwgNTsgZGF5KyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0ZWFjaGVyLmRheXNBdmFpbGFibGVbZGF5XSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBMaXN0PEJydXRlRm9yY2VkU3R1ZGVudD4gcmVzdWx0ID0gQnJ1dGVGb3JjZVN0dWRlbnRzKGRheSwgdGVhY2hlci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldLCB0ZWFjaGVyLm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGludCBpID0gMDsgaSA8IHJlc3VsdC5Db3VudDsgaSsrKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2ldLnN0dWRlbnQuYXNzaWduZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbaV0uc3R1ZGVudC5hc3NpZ25lZERheSA9IGRheTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2ldLnN0dWRlbnQuYXNzaWduZWRNaW51dGVzID0gcmVzdWx0W2ldLm1pbnV0ZXNGcm9tO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBMaXN0PEJydXRlRm9yY2VkU3R1ZGVudD4gQnJ1dGVGb3JjZVN0dWRlbnRzKGludCBkYXksIGludCBzdGFydFRpbWUsIGludCBlbmRUaW1lLCBpbnQgc3R1ZGVudHNQb3NzZWQpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpZiAoc3RhcnRUaW1lID49IGVuZFRpbWUgLSBsZXNzb25MZW5ndGgpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTGlzdDxCcnV0ZUZvcmNlZFN0dWRlbnQ+KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBzdGFydFN0dWRlbnQgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4gIXguYXNzaWduZWQgJiYgeC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldID49IHN0YXJ0VGltZSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeC5taW51dGVzVG9BdmFpbGFibGVbZGF5XSA8PSBlbmRUaW1lKSkuT3JkZXJCeTxpbnQ+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBpbnQ+KSh4ID0+IHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSkpLkZpcnN0T3JEZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGlmIChzdGFydFN0dWRlbnQgPT0gbnVsbClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgc3RhcnRUaW1lICs9IDU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gQnJ1dGVGb3JjZVN0dWRlbnRzKGRheSwgc3RhcnRUaW1lLCBlbmRUaW1lLCBzdHVkZW50c1Bvc3NlZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGludCBzdGFydFN0dWRlbnRTdGFydFRpbWUgPSBzdGFydFN0dWRlbnQubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XTtcclxuXHJcblxyXG4gICAgICAgICAgICBzdHVkZW50c1Bvc3NlZCsrO1xyXG4gICAgICAgICAgICBzdGFydFRpbWUgKz0gbGVzc29uTGVuZ3RoO1xyXG4gICAgICAgICAgICBpZiAoc3R1ZGVudHNQb3NzZWQgPT0gYnJlYWtBZnRlckxlc3NvbnMpXHJcbiAgICAgICAgICAgICAgICBzdGFydFRpbWUgKz0gYnJlYWtBZnRlckxlc3NvbnNMZW5ndGg7XHJcbiAgICAgICAgICAgIHZhciBhbm90aGVyU3R1ZGVudHMgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyPihzdHVkZW50cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlciwgYm9vbD4pKHggPT4gIXguYXNzaWduZWQgJiYgeC5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldID4gc3RhcnRTdHVkZW50U3RhcnRUaW1lIC0gbGVzc29uTGVuZ3RoICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgubWludXRlc1RvQXZhaWxhYmxlW2RheV0gPD0gZW5kVGltZSAmJiB4ICE9IHN0YXJ0U3R1ZGVudCkpO1xyXG5cclxuICAgICAgICAgICAgQ29uc29sZS5Xcml0ZUxpbmUoXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tXCIpO1xyXG4gICAgICAgICAgICBDb25zb2xlLldyaXRlKHN0YXJ0U3R1ZGVudC5uYW1lICsgXCIsXCIpO1xyXG4gICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShTdHJpbmcuSm9pbihcIixcIiwgYW5vdGhlclN0dWRlbnRzLlNlbGVjdDxzdHJpbmc+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBzdHJpbmc+KSh4ID0+IHgubmFtZSkpKSk7XHJcblxyXG4gICAgICAgICAgICBMaXN0PExpc3Q8QnJ1dGVGb3JjZWRTdHVkZW50Pj4gcHJlUmVzdWx0ID0gbmV3IExpc3Q8TGlzdDxCcnV0ZUZvcmNlZFN0dWRlbnQ+PigpO1xyXG5cclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgTGlzdDxCcnV0ZUZvcmNlZFN0dWRlbnQ+IHBvc3NSZXN1bHQgPSBuZXcgTGlzdDxCcnV0ZUZvcmNlZFN0dWRlbnQ+KCk7XHJcbiAgICAgICAgICAgICAgICBwb3NzUmVzdWx0LkFkZChuZXcgQnJ1dGVGb3JjZWRTdHVkZW50KHN0YXJ0U3R1ZGVudFN0YXJ0VGltZSwgc3RhcnRTdHVkZW50KSk7XHJcbiAgICAgICAgICAgICAgICBMaXN0PEJydXRlRm9yY2VkU3R1ZGVudD4gbmV3U3R1ZGVudHMgPSBCcnV0ZUZvcmNlU3R1ZGVudHMoZGF5LCBzdGFydFRpbWUsIGVuZFRpbWUsIHN0dWRlbnRzUG9zc2VkKTtcclxuICAgICAgICAgICAgICAgIGlmIChuZXdTdHVkZW50cyAhPSBudWxsKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc3NSZXN1bHQuQWRkUmFuZ2UobmV3U3R1ZGVudHMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcHJlUmVzdWx0LkFkZChwb3NzUmVzdWx0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3JlYWNoICh2YXIgYW5vdGhlclN0dWRlbnQgaW4gYW5vdGhlclN0dWRlbnRzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBMaXN0PEJydXRlRm9yY2VkU3R1ZGVudD4gcG9zc2libGVSZXN1bHQgPSBuZXcgTGlzdDxCcnV0ZUZvcmNlZFN0dWRlbnQ+KCk7XHJcbiAgICAgICAgICAgICAgICBwb3NzaWJsZVJlc3VsdC5BZGQobmV3IEJydXRlRm9yY2VkU3R1ZGVudChNYXRoLk1heChzdGFydFRpbWUsIGFub3RoZXJTdHVkZW50Lm1pbnV0ZXNGcm9tQXZhaWxhYmxlW2RheV0pLCBhbm90aGVyU3R1ZGVudCkpO1xyXG4gICAgICAgICAgICAgICAgTGlzdDxCcnV0ZUZvcmNlZFN0dWRlbnQ+IG5ld1N0dWRlbnRzID0gQnJ1dGVGb3JjZVN0dWRlbnRzKGRheSwgc3RhcnRUaW1lLCBlbmRUaW1lLCBzdHVkZW50c1Bvc3NlZCk7XHJcbiAgICAgICAgICAgICAgICBpZiAobmV3U3R1ZGVudHMgIT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NzaWJsZVJlc3VsdC5BZGRSYW5nZShuZXdTdHVkZW50cyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBwcmVSZXN1bHQuQWRkKHBvc3NpYmxlUmVzdWx0KTtcclxuICAgICAgICAgICAgfVxyXG5TeXN0ZW0uTGlucS5FbnVtZXJhYmxlLk9yZGVyQnlEZXNjZW5kaW5nPGdsb2JhbDo6U3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWMuTGlzdDxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuQnJ1dGVGb3JjZWRTdHVkZW50PixpbnQ+KFxyXG4gICAgICAgICAgICBwcmVSZXN1bHQsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTeXN0ZW0uQ29sbGVjdGlvbnMuR2VuZXJpYy5MaXN0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5CcnV0ZUZvcmNlZFN0dWRlbnQ+LCBpbnQ+KSh4ID0+IHguQ291bnQpKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkZpcnN0PGdsb2JhbDo6U3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWMuTGlzdDxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuQnJ1dGVGb3JjZWRTdHVkZW50Pj4ocHJlUmVzdWx0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBJRG9udENhcmVKdXN0UG9zc1N0dWRlbnRzKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIFVzZXIgdGVhY2hlciA9IHRlYWNoZXJzWzBdO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpbnQgZGF5ID0gMDsgZGF5IDwgNTsgZGF5KyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGlmICh0ZWFjaGVyLmRheXNBdmFpbGFibGVbZGF5XSlcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnQgc3RhcnRUaW1lID0gdGVhY2hlci5taW51dGVzRnJvbUF2YWlsYWJsZVtkYXldO1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBlbmRUaW1lID0gdGVhY2hlci5taW51dGVzVG9BdmFpbGFibGVbZGF5XTtcclxuICAgICAgICAgICAgICAgICAgICBpbnQgc3R1ZGVudHNQb3NzZWQgPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGludCBtaW51dGUgPSAwOyBtaW51dGUgPCBlbmRUaW1lIC0gc3RhcnRUaW1lOylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdHVkZW50c1JpZ2h0Tm93ID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KSh4ID0+ICF4LmFzc2lnbmVkICYmIHguZGF5c0F2YWlsYWJsZVtkYXldICYmIHgubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA8PSBzdGFydFRpbWUgKyBtaW51dGUgJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldID49IHN0YXJ0VGltZSArIG1pbnV0ZSArIGxlc3Nvbkxlbmd0aCkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0dWRlbnRzUmlnaHROb3cuQ291bnQoKSA9PSAwKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW51dGUrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3R1ZGVudFRvUG9zID0gc3R1ZGVudHNSaWdodE5vdy5GaXJzdCgpOyAvLyBUT0RPOiBDaG9vc2Ugc29tZW9uZSBiZXR0ZXIgd2F5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRUb1Bvcy5hc3NpZ25lZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRUb1Bvcy5hc3NpZ25lZERheSA9IGRheTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudFRvUG9zLmFzc2lnbmVkTWludXRlcyA9IHN0YXJ0VGltZSArIG1pbnV0ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnRzUG9zc2VkKys7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtaW51dGUgKz0gbGVzc29uTGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0dWRlbnRzUG9zc2VkID09IGJyZWFrQWZ0ZXJMZXNzb25zKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha0FmdGVyTGVzc29uc1N0YXJ0W2RheV0gPSBzdGFydFRpbWUgKyBtaW51dGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW51dGUgKz0gYnJlYWtBZnRlckxlc3NvbnNMZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50c1Bvc3NlZCsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgRG9JdFVzaW5nRmxvd3MoKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgRmxvdyBmbG93ID0gbmV3IEZsb3codGVhY2hlcnNbMF0sIHN0dWRlbnRzKTtcclxuICAgICAgICAgICAgaW50W10gYnJlYWtzID0gZmxvdy5HZXRSZXN1bHQoKTtcclxuICAgICAgICAgICAgYnJlYWtBZnRlckxlc3NvbnNTdGFydCA9IGJyZWFrcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJuYWwgc3RydWN0IEJydXRlRm9yY2VkU3R1ZGVudFxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBpbnQgbWludXRlc0Zyb207XHJcbiAgICAgICAgcHVibGljIFVzZXIgc3R1ZGVudDtcclxuXHJcbiAgICAgICAgcHVibGljIEJydXRlRm9yY2VkU3R1ZGVudChpbnQgbWludXRlc0Zyb20sIFVzZXIgc3R1ZGVudClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRoaXMubWludXRlc0Zyb20gPSBtaW51dGVzRnJvbTtcclxuICAgICAgICAgICAgdGhpcy5zdHVkZW50ID0gc3R1ZGVudDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93XHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBFZGdlXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIGludCBDYXBhY2l0eTtcclxuICAgICAgICBwcml2YXRlIGludCBjdXJyZW50RmxvdztcclxuICAgICAgICBwdWJsaWMgTm9kZSBGcm9tO1xyXG4gICAgICAgIHB1YmxpYyBOb2RlIFRvO1xyXG5cclxuICAgICAgICBwdWJsaWMgRWRnZShpbnQgY2FwYWNpdHksIGludCBjdXJyZW50RmxvdywgTm9kZSBmcm9tLCBOb2RlIHRvKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgQ2FwYWNpdHkgPSBjYXBhY2l0eTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50RmxvdyA9IGN1cnJlbnRGbG93O1xyXG4gICAgICAgICAgICBGcm9tID0gZnJvbTtcclxuICAgICAgICAgICAgVG8gPSB0bztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyB2aXJ0dWFsIGludCBHZXRDdXJyZW50RmxvdyhJRW51bWVyYWJsZTxOb2RlPiBjdXJyZW50UGF0aCwgRmxvdyBmbG93KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRGbG93O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHZpcnR1YWwgdm9pZCBTZXRDdXJyZW50RmxvdyhpbnQgbmV3VmFsdWUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBjdXJyZW50RmxvdyA9IG5ld1ZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvd1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgRmxvd1xyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBMaXN0PE5vZGU+IE5vZGVzIHsgZ2V0OyBwcml2YXRlIHNldDsgfVxyXG5cclxuICAgICAgICBwcml2YXRlIFVzZXIgdGVhY2hlcjtcclxuICAgICAgICBwcml2YXRlIExpc3Q8VXNlcj4gc3R1ZGVudHM7XHJcblxyXG4gICAgICAgIC8vIFRPRE86IFN0dWRlbnQgbmFtZSBtdXN0IE5PVCBjb250YWluIHRoaXMgY2hhciAtPiA6XHJcbiAgICAgICAgcHVibGljIEZsb3coVXNlciB0ZWFjaGVyLCBMaXN0PFVzZXI+IHN0dWRlbnRzKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGhpcy50ZWFjaGVyID0gdGVhY2hlcjtcclxuICAgICAgICAgICAgdGhpcy5zdHVkZW50cyA9IHN0dWRlbnRzO1xyXG4gICAgICAgICAgICB0aGlzLk5vZGVzID0gbmV3IExpc3Q8Tm9kZT4oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vLyA8c3VtbWFyeT5cclxuICAgICAgICAvLy8gR2V0cyByZXN1bHQgdXNpbmcgZmxvd3MuIFRoaXMgbWV0aG9kIHdpbGwgc2V0IHN0dWRlbnQgYXNzaWduZWQgdGltZXMgYW5kIHJldHVybiBhcnJheSBvZiBtaW51dGVzLCB3aGVuIGlzIGJyZWFrIHRpbWUgZWFjaCBkYXlcclxuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxyXG4gICAgICAgIC8vLyA8cmV0dXJucz48L3JldHVybnM+XHJcbiAgICAgICAgcHVibGljIGludFtdIEdldFJlc3VsdCgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBpbnRbXSBicmVha3MgPSBuZXcgaW50WzVdO1xyXG5cclxuICAgICAgICAgICAgZm9yIChpbnQgZGF5ID0gMDsgZGF5IDwgNTsgZGF5KyspXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIENvbnNvbGUuV3JpdGVMaW5lKHN0cmluZy5Gb3JtYXQoXCI9PT09PT09PT09PT09PT09PT09REVOOiB7MH09PT09PT09PT09PT09PVwiLGRheSkpO1xyXG4gICAgICAgICAgICAgICAgQnVpbGRHcmFwaChkYXkpO1xyXG4gICAgICAgICAgICAgICAgU3RhcnQoKTtcclxuICAgICAgICAgICAgICAgIENvbnNvbGUuV3JpdGVMaW5lKFwiRG9iZWhsbyB0by4uLlwiKTtcclxuICAgICAgICAgICAgICAgIHZhciBzdHVkZW50c1RvZGF5ID0gR2V0UmVzdWx0RnJvbUdyYXBoKGRheSk7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbW9yZSB0aGVuIHRocmVlIHN0dWRlbnRzIHRvZGF5OlxyXG4gICAgICAgICAgICAgICAgaWYgKHN0dWRlbnRzVG9kYXkuQ291bnQgPiAzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFNhdmUgZmlyc3QgdGhyZWUgc3R1ZGVudCB0aW1lc1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoaW50IGkgPSAwOyBpIDwgMzsgaSsrKSBBcHBseVN0dWRlbnQoc3R1ZGVudHNUb2RheVtpXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRGlzYWJsZSBtaW51dGVzIGFuZCByZWNvcmQgYnJlYWsgdGltZVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrc1tkYXldID0gc3R1ZGVudHNUb2RheVsyXS50aW1lU3RhcnQgKyA1MDtcclxuICAgICAgICAgICAgICAgICAgICAvLyBTdGFydCBhZ2FpbiAocmVtb3ZlIGZpcnN0IHR3byBzdHVkZW50cyBhbmQgdGhlaXIgdGltZXMpXHJcbiAgICAgICAgICAgICAgICAgICAgQnVpbGRHcmFwaChkYXksIGJyZWFrc1tkYXldLCBicmVha3NbZGF5XSArIFBsYW4uYnJlYWtBZnRlckxlc3NvbnNMZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIFN0YXJ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgc3R1ZGVudHNUb2RheSA9IEdldFJlc3VsdEZyb21HcmFwaChkYXkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrc1tkYXldID0gaW50Lk1heFZhbHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFwcGx5IGFsbCBzdHVkZW50c1xyXG4gICAgICAgICAgICAgICAgZm9yZWFjaCAoQXNzaWdubWVudFByZXZpZXcgcmVzdWx0IGluIHN0dWRlbnRzVG9kYXkpIEFwcGx5U3R1ZGVudChyZXN1bHQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShcIkJyZWFrOiBcIik7XHJcbiAgICAgICAgICAgIENvbnNvbGUuV3JpdGVMaW5lKFN0cmluZy5Kb2luPGludD4oXCIsIFwiLCBicmVha3MpKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBicmVha3M7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgQnVpbGRHcmFwaChpbnQgZGF5LCBpbnQgYmFubmVkVGltZXNwYW5Gcm9tID0gLTEsIGludCBiYW5uZWRUaW1lc3BhblRvID0gLTEpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBOb2Rlcy5DbGVhcigpO1xyXG4gICAgICAgICAgICAvLyBBZGQgcm9vdCBub2RlXHJcbiAgICAgICAgICAgIE5vZGUgcm9vdCA9IG5ldyBOb2RlKFwiSW5wdXRcIiwgLTEsIE5vZGUuTm9kZVR5cGUuSW5wdXQpO1xyXG4gICAgICAgICAgICBOb2Rlcy5BZGQocm9vdCk7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgYWxsIHN0dWRlbnRzIG5vZGVzXHJcbiAgICAgICAgICAgIGZvcmVhY2ggKFVzZXIgc3R1ZGVudCBpbiBzdHVkZW50cylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0dWRlbnQuYXNzaWduZWQgfHwgIXN0dWRlbnQuZGF5c0F2YWlsYWJsZVtkYXldKVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IEVycm9yIHdoZW4gbXVsdGlwbGUgc3R1ZGVudHMgd2l0aCBzYW1lIG5hbWVcclxuICAgICAgICAgICAgICAgIE5vZGUgc3R1ZGVudE5vZGUgPSBuZXcgTm9kZShcIlN0dWRlbnQ6XCIgKyBzdHVkZW50Lm5hbWUsIC0xLCBOb2RlLk5vZGVUeXBlLkRlZmF1bHQpO1xyXG4gICAgICAgICAgICAgICAgQWRkTm9kZUFmdGVyKFwiSW5wdXRcIiwgc3R1ZGVudE5vZGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBQcmVwYXJlIHRpbWUgY2h1bmsgbm9kZVxyXG4gICAgICAgICAgICBOb2RlIHRpbWVDaHVuayA9IG5ldyBOb2RlKFwiVGltZUNodW5rXCIsIC0xLCBOb2RlLk5vZGVUeXBlLkRlZmF1bHQpO1xyXG5cclxuICAgICAgICAgICAgdmFyIG9jY3VwaWVkVGltZXNUb2RheSA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoc3R1ZGVudCA9PiBzdHVkZW50LmFzc2lnbmVkRGF5ID09IGRheSkpLlNlbGVjdDxpbnQ+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBpbnQ+KShzdHVkZW50ID0+IHN0dWRlbnQuYXNzaWduZWRNaW51dGVzKSk7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgYWxsIHRpbWVzIG5vZGVzXHJcbiAgICAgICAgICAgIGZvciAoaW50IHRpbWUgPSAwOyB0aW1lIDwgMjQgKiA2MDsgdGltZSArPSA1KVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgdGltZSBpcyBiYW5uZWQgb3Igc29tZW9uZSBhbHJlYWR5IHBvc2l0aW9uZWQgdXNlZCB0aGUgdGltZSwgc2tpcCB0byBuZXh0IHRpbWVcclxuICAgICAgICAgICAgICAgIGlmICgodGltZSA+PSBiYW5uZWRUaW1lc3BhbkZyb20gJiYgdGltZSA8PSBiYW5uZWRUaW1lc3BhblRvKSB8fFxyXG4gICAgICAgICAgICAgICAgICAgIG9jY3VwaWVkVGltZXNUb2RheS5XaGVyZSgoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxpbnQsIGJvb2w+KShvY2NUaW1lID0+IE1hdGguQWJzKG9jY1RpbWUgLSB0aW1lKSA8IDUwKSkuQ291bnQoKSA+IDApXHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRlYWNoZXIubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA8PSB0aW1lICYmIHRlYWNoZXIubWludXRlc1RvQXZhaWxhYmxlW2RheV0gLSBQbGFuLmxlc3Nvbkxlbmd0aCA+PSB0aW1lKVxyXG4gICAgICAgICAgICAgICAge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgc3R1ZGVudHNBdFRoaXNUaW1lID0gLyogU3R1ZGVudHMgdGhhdCBoYXZlIHRpbWUgcmlnaHQgbm93ICovIFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXI+KHN0dWRlbnRzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5Vc2VyLCBib29sPikoc3R1ZGVudCA9PiAhc3R1ZGVudC5hc3NpZ25lZCAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R1ZGVudC5kYXlzQXZhaWxhYmxlW2RheV0gJiZcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0dWRlbnQubWludXRlc0Zyb21BdmFpbGFibGVbZGF5XSA8PSB0aW1lICYmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHVkZW50Lm1pbnV0ZXNUb0F2YWlsYWJsZVtkYXldIC0gUGxhbi5sZXNzb25MZW5ndGggPj0gdGltZSkpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBOb2RlIHRpbWVOb2RlID0gbmV3IE5vZGUoXCJUaW1lOlwiICsgdGltZSwgdGltZSwgTm9kZS5Ob2RlVHlwZS5EZWZhdWx0KTtcclxuICAgICAgICAgICAgICAgICAgICBmb3JlYWNoIChVc2VyIHN0dWRlbnQgaW4gc3R1ZGVudHNBdFRoaXNUaW1lKVxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgQWRkTm9kZUFmdGVyKFwiU3R1ZGVudDpcIiArIHN0dWRlbnQubmFtZSwgdGltZU5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBBZGROb2RlQWZ0ZXIoXCJUaW1lOlwiICsgdGltZSwgdGltZUNodW5rKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ29ubmVjdCBUaW1lIENodW5rIHdpdGggb3V0cHV0XHJcbiAgICAgICAgICAgIE5vZGUgb3V0cHV0ID0gbmV3IE5vZGUoXCJPdXRwdXRcIiwgLTEsIE5vZGUuTm9kZVR5cGUuT3V0cHV0KTtcclxuICAgICAgICAgICAgQWRkTm9kZUFmdGVyKFwiVGltZUNodW5rXCIsIG91dHB1dCk7XHJcblxyXG4gICAgICAgICAgICAvLyBDaGFuZ2UgZWRnZSBiZXR3ZWVuIFRpbWVDaHVuayhOb2RlKSBhbmQgT3V0cHV0IHRvIFRpbWVDaHVuayhFZGdlKVxyXG4gICAgICAgICAgICBUaW1lQ2h1bmsgdGltZUNodW5rRWRnZSA9IG5ldyBUaW1lQ2h1bmsodGltZUNodW5rLCBvdXRwdXQpO1xyXG4gICAgICAgICAgICB0aW1lQ2h1bmsuT3V0cHV0RWRnZXMuQ2xlYXIoKTtcclxuICAgICAgICAgICAgdGltZUNodW5rLk91dHB1dEVkZ2VzLkFkZCh0aW1lQ2h1bmtFZGdlKTtcclxuICAgICAgICAgICAgb3V0cHV0LklucHV0RWRnZXMuQ2xlYXIoKTtcclxuICAgICAgICAgICAgb3V0cHV0LklucHV0RWRnZXMuQWRkKHRpbWVDaHVua0VkZ2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIEFkZE5vZGVBZnRlcihzdHJpbmcgaWRlbnRpZmllciwgTm9kZSBuZXdOb2RlKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZm9yZWFjaCAoTm9kZSBub2RlIGluIE5vZGVzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5JZGVudGlmaWVyID09IGlkZW50aWZpZXIpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgRWRnZSBuZXdFZGdlID0gbmV3IEVkZ2UoMSwgMCwgbm9kZSwgbmV3Tm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5PdXRwdXRFZGdlcy5BZGQobmV3RWRnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3Tm9kZS5JbnB1dEVkZ2VzLkFkZChuZXdFZGdlKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIU5vZGVzLkNvbnRhaW5zKG5ld05vZGUpKVxyXG4gICAgICAgICAgICAgICAgTm9kZXMuQWRkKG5ld05vZGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIFN0YXJ0KClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIFdoaWxlIHdlIGFyZSBjcmVhdGluZyBuZXcgZmxvdywga2VlcCBkb2luZyBpdFxyXG4gICAgICAgICAgICB3aGlsZSAoQ3JlYXRlTmV3RmxvdygpKSA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZXR1cm4gdmFsdWU6IGRpZCB3ZSBjcmVhdGUgbmV3IGZsb3c/XHJcbiAgICAgICAgcHJpdmF0ZSBib29sIENyZWF0ZU5ld0Zsb3coKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgLy8gTGV0J3MgY3JlYXRlIGRpY3Rpb25hcnkgb2YgTm9kZSA6IFNvdXJjZU5vZGVcclxuICAgICAgICAgICAgLy8gICstLS0tKy0tLS0rLS0tLSstLS0tLSstLS0tLStcclxuICAgICAgICAgICAgLy8gIHwgQTEgfCBBMiB8IEIxIHwgVENIIHwgT1VUIHwgXHJcbiAgICAgICAgICAgIC8vICArLS0tLSstLS0tKy0tLS0rLS0tLS0rLS0tLS0rXHJcbiAgICAgICAgICAgIC8vICB8IEkgIHwgSSAgfCBBMSB8IEIxICB8IFRDSCB8XHJcbiAgICAgICAgICAgIC8vICArLS0tLSstLS0tKy0tLS0rLS0tLS0rLS0tLS0rXHJcblxyXG4gICAgICAgICAgICBEaWN0aW9uYXJ5PE5vZGUsIE5vZGU+IEZsb3dQYXRoID0gbmV3IERpY3Rpb25hcnk8Tm9kZSwgTm9kZT4oTm9kZXMuQ291bnQpO1xyXG4gICAgICAgICAgICBmb3IgKGludCBpID0gMTsgaSA8IE5vZGVzLkNvdW50OyBpKyspIEZsb3dQYXRoLkFkZChOb2Rlc1tpXSwgbnVsbCk7IC8vIEFkZCBhbGwgbm9kZXMgaW50byBGbG93UGF0aCAhZXhjZXB0IGZvciByb290IG5vZGVcclxuXHJcbiAgICAgICAgICAgIFF1ZXVlPE5vZGU+IE5vZGVzVG9Qcm9jZXNzID0gbmV3IFF1ZXVlPE5vZGU+KCk7XHJcbiAgICAgICAgICAgIE5vZGVzVG9Qcm9jZXNzLkVucXVldWUoTm9kZXNbMF0pOyAvLyBNYXJrIHJvb3Qgbm9kZSBhcyB0by1wcm9jZXNzXHJcblxyXG4gICAgICAgICAgICBIYXNoU2V0PE5vZGU+IEFscmVhZHlBZGRlZE5vZGVzID0gbmV3IEhhc2hTZXQ8Tm9kZT4oKTtcclxuICAgICAgICAgICAgQWxyZWFkeUFkZGVkTm9kZXMuQWRkKE5vZGVzWzBdKTtcclxuICAgICAgICAgICAgd2hpbGUgKE5vZGVzVG9Qcm9jZXNzLkNvdW50ID4gMClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgLy8gR2V0IGFsbCBub2RlcyB0aGF0IHN0aWxsIGhhdmUgYXZhaWFibGUgZmxvdyBzcGFjZSBpbiB0aGVtIGFuZCBhcmVuJ3Qgb2NjdXBpZWQgKGluIEZsb3dQYXRoKVxyXG4gICAgICAgICAgICAgICAgTm9kZSBub2RlID0gTm9kZXNUb1Byb2Nlc3MuRGVxdWV1ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIE5vZGVzIHRoYXQgYXJlIGFjY2Vzc2FibGUgZnJvbSB0aGlzIG5vZGVcclxuICAgICAgICAgICAgICAgIExpc3Q8Tm9kZT4gYXZhaWFibGVOb2RlcyA9IG5ldyBMaXN0PE5vZGU+KG5vZGUuT3V0cHV0RWRnZXMuQ291bnQgKyBub2RlLklucHV0RWRnZXMuQ291bnQpO1xyXG5cclxuICAgICAgICAgICAgICAgIGJvb2wgZG9JbnB1dEVkZ2VzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIExpc3Q8Tm9kZT4gcmVuZGVyZWRQYXRoID0gUmVuZGVyUGF0aChTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkZpcnN0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPihOb2RlcyksIG5vZGUsIEZsb3dQYXRoKTtcclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKEVkZ2Ugb3V0cHV0RWRnZSBpbiBub2RlLk91dHB1dEVkZ2VzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGludCBmbG93ID0gb3V0cHV0RWRnZS5HZXRDdXJyZW50RmxvdyhyZW5kZXJlZFBhdGgsIHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmbG93ID4gMSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9JbnB1dEVkZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZsb3cgPT0gMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWFibGVOb2Rlcy5BZGQob3V0cHV0RWRnZS5Ubyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZG9JbnB1dEVkZ2VzKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcmVhY2ggKEVkZ2UgaW5wdXRFZGdlIGluIG5vZGUuSW5wdXRFZGdlcylcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW5kZXJlZFBhdGguQ291bnQgPj0gMiAmJiBpbnB1dEVkZ2UuRnJvbSA9PSByZW5kZXJlZFBhdGhbcmVuZGVyZWRQYXRoLkNvdW50IC0gMl0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGludCBmbG93ID0gaW5wdXRFZGdlLkdldEN1cnJlbnRGbG93KHJlbmRlcmVkUGF0aCwgdGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmbG93ID09IDEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdmFpYWJsZU5vZGVzLkFkZChpbnB1dEVkZ2UuRnJvbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEZpbGwgYWxsIG5vZGVzIHRoYXQgYXJlIGFjY2Vzc2libGUgZnJvbSB0aGlzIG5vZGVcclxuICAgICAgICAgICAgICAgIGZvcmVhY2ggKE5vZGUgbm9kZVRvR29UaHJvdWdoIGluIGF2YWlhYmxlTm9kZXMpXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKEFscmVhZHlBZGRlZE5vZGVzLkNvbnRhaW5zKG5vZGVUb0dvVGhyb3VnaCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBBbHJlYWR5QWRkZWROb2Rlcy5BZGQobm9kZVRvR29UaHJvdWdoKTtcclxuICAgICAgICAgICAgICAgICAgICBGbG93UGF0aFtub2RlVG9Hb1Rocm91Z2hdID0gbm9kZTtcclxuICAgICAgICAgICAgICAgICAgICBOb2Rlc1RvUHJvY2Vzcy5FbnF1ZXVlKG5vZGVUb0dvVGhyb3VnaCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIE5vdywgSSAocHJvYmFibHkpIGhhdmUgZmxvd1xyXG4gICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZSh0aGlzLlRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICBERUJVR19Xcml0ZUZsb3dQYXRoKEZsb3dQYXRoKTtcclxuICAgICAgICAgICAgdmFyIFRpbWVDaHVuayA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGU+KEZsb3dQYXRoLktleXMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsIGJvb2w+KSh4ID0+IHguSWRlbnRpZmllciA9PSBcIlRpbWVDaHVua1wiKSkuU2luZ2xlT3JEZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGlmIChUaW1lQ2h1bmsgPT0gbnVsbCB8fCBGbG93UGF0aFtUaW1lQ2h1bmtdID09IG51bGwpXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIENvbnNvbGUuV3JpdGVMaW5lKFwiTm8gZmxvd1wiKTtcclxuICAgICAgICAgICAgICAgIC8vIE5vIGZsb3dcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIENvbnNvbGUuV3JpdGVMaW5lKFwiQXBwbHlpbmcgZmxvd1wiKTtcclxuICAgICAgICAgICAgICAgIEFwcGx5RmxvdyhTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLkZpcnN0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPihOb2RlcyksIFRpbWVDaHVuaywgRmxvd1BhdGgpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgdm9pZCBERUJVR19Xcml0ZUZsb3dQYXRoKERpY3Rpb25hcnk8Tm9kZSwgTm9kZT4gRmxvd1BhdGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBzdHJpbmcgb3V0cHV0ID0gXCJLZXlzOiBcIiArIFN0cmluZy5Kb2luKFwiIHwgXCIsIFN5c3RlbS5MaW5xLkVudW1lcmFibGUuU2VsZWN0PGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLHN0cmluZz4oRmxvd1BhdGguS2V5cywoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSwgc3RyaW5nPikoeCA9PiB4LklkZW50aWZpZXIpKSk7XHJcbiAgICAgICAgICAgIG91dHB1dCArPSBcIlxcblwiO1xyXG4gICAgICAgICAgICBvdXRwdXQgKz0gXCJWYWx1ZXM6IFwiICsgU3RyaW5nLkpvaW4oXCIgfCBcIiwgU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5TZWxlY3Q8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsc3RyaW5nPihGbG93UGF0aC5WYWx1ZXMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsIHN0cmluZz4pKHggPT4geCA9PSBudWxsID8gXCItLS1cIiA6IHguSWRlbnRpZmllcikpKTtcclxuICAgICAgICAgICAgQ29uc29sZS5Xcml0ZUxpbmUob3V0cHV0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgTGlzdDxOb2RlPiBSZW5kZXJQYXRoKE5vZGUgcm9vdE5vZGUsIE5vZGUgZW5kTm9kZSwgRGljdGlvbmFyeTxOb2RlLCBOb2RlPiBmbG93UGF0aClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIExpc3Q8Tm9kZT4gcGF0aCA9IG5ldyBMaXN0PE5vZGU+KCk7XHJcbiAgICAgICAgICAgIHBhdGguQWRkKGVuZE5vZGUpO1xyXG5cclxuICAgICAgICAgICAgTm9kZSBuZXh0Tm9kZSA9IGVuZE5vZGU7XHJcbiAgICAgICAgICAgIHdoaWxlIChuZXh0Tm9kZSAhPSByb290Tm9kZSlcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbmV4dE5vZGUgPSBmbG93UGF0aFtuZXh0Tm9kZV07XHJcbiAgICAgICAgICAgICAgICBwYXRoLkFkZChuZXh0Tm9kZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHBhdGguUmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gcGF0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgTGlzdDxBc3NpZ25tZW50UHJldmlldz4gR2V0UmVzdWx0RnJvbUdyYXBoKGludCBkYXkpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBDb25zb2xlLldyaXRlKFwiU3RhcnR1amUgR2V0UmVzdWx0RnJvbUdyYXBoXCIpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRpbWVOb2RlcyA9IFN5c3RlbS5MaW5xLkVudW1lcmFibGUuV2hlcmU8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGU+KE5vZGVzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLCBib29sPikobm9kZSA9PiBub2RlLlZhbHVlICE9IC0xKSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgdXNlZFRpbWVOb2RlcyA9IHRpbWVOb2Rlcy5XaGVyZSgoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSwgYm9vbD4pKG5vZGUgPT4gbm9kZS5JbnB1dEVkZ2VzLkNvdW50ICE9IDApKTtcclxuXHJcbiAgICAgICAgICAgIENvbnNvbGUuV3JpdGUodXNlZFRpbWVOb2Rlcy5Db3VudCgpKTtcclxuXHJcbiAgICAgICAgICAgIC8vdmFyIGVkZ2VzID0gdXNlZFRpbWVOb2Rlcy5TZWxlY3Qobm9kZSA9PiBub2RlLklucHV0RWRnZXMuV2hlcmUoZWRnZSA9PiBlZGdlLkdldEN1cnJlbnRGbG93KG51bGwsIG51bGwpID09IDEpLlNpbmdsZSgpKTtcclxuICAgICAgICAgICAgdmFyIGVkZ2VzID0gdXNlZFRpbWVOb2Rlcy5XaGVyZSgoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSwgYm9vbD4pKG5vZGUgPT4gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZT4obm9kZS5JbnB1dEVkZ2VzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlLCBib29sPikoZWRnZSA9PiBlZGdlLkdldEN1cnJlbnRGbG93KG51bGwsIG51bGwpID09IDEpKS5Db3VudCgpID09IDEpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLlNlbGVjdDxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZT4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsIGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlPikobm9kZSA9PiBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlPihub2RlLklucHV0RWRnZXMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2UsIGJvb2w+KShlZGdlID0+IGVkZ2UuR2V0Q3VycmVudEZsb3cobnVsbCwgbnVsbCkgPT0gMSkpLlNpbmdsZSgpKSk7XHJcblxyXG4gICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShlZGdlcy5Db3VudCgpKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBlZGdlcy5TZWxlY3Q8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkZsb3cuQXNzaWdubWVudFByZXZpZXc+KChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlLCBnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRmxvdy5Bc3NpZ25tZW50UHJldmlldz4pKGVkZ2UgPT4gbmV3IEFzc2lnbm1lbnRQcmV2aWV3KClcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgYXNzaWduZWRTdHVkZW50ID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuVXNlcj4oc3R1ZGVudHMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLlVzZXIsIGJvb2w+KShzdHVkZW50ID0+IHN0dWRlbnQubmFtZSA9PSBlZGdlLkZyb20uSWRlbnRpZmllci5TcGxpdCgnOicpWzFdKSkuU2luZ2xlKCksXHJcbiAgICAgICAgICAgICAgICBkYXkgPSBkYXksXHJcbiAgICAgICAgICAgICAgICB0aW1lU3RhcnQgPSBlZGdlLlRvLlZhbHVlXHJcbiAgICAgICAgICAgIH0pKS5PcmRlckJ5PGludD4oKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkZsb3cuQXNzaWdubWVudFByZXZpZXcsIGludD4pKHJlc3VsdCA9PiByZXN1bHQudGltZVN0YXJ0KSkuVG9MaXN0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHZvaWQgQXBwbHlTdHVkZW50KEFzc2lnbm1lbnRQcmV2aWV3IHJlc3VsdClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHJlc3VsdC5hc3NpZ25lZFN0dWRlbnQuYXNzaWduZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICByZXN1bHQuYXNzaWduZWRTdHVkZW50LmFzc2lnbmVkRGF5ID0gcmVzdWx0LmRheTtcclxuICAgICAgICAgICAgcmVzdWx0LmFzc2lnbmVkU3R1ZGVudC5hc3NpZ25lZE1pbnV0ZXMgPSByZXN1bHQudGltZVN0YXJ0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB2b2lkIEFwcGx5RmxvdyhOb2RlIHJvb3ROb2RlLCBOb2RlIGVuZE5vZGUsIERpY3Rpb25hcnk8Tm9kZSwgTm9kZT4gZmxvd1BhdGgpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBOb2RlIG5leHROb2RlID0gZW5kTm9kZTtcclxuICAgICAgICAgICAgd2hpbGUgKG5leHROb2RlICE9IHJvb3ROb2RlKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBFZGdlSW5mbyBlZGdlID0gR2V0RWRnZUluZm8obmV4dE5vZGUsIGZsb3dQYXRoW25leHROb2RlXSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGVkZ2UuSXNGcm9tTm9kZTFUb05vZGUyKVxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGVkZ2UuUmVzdWx0RWRnZS5TZXRDdXJyZW50RmxvdygwKTtcclxuICAgICAgICAgICAgICAgICAgICBDb25zb2xlLldyaXRlTGluZShzdHJpbmcuRm9ybWF0KFwiU2V0dGluZyBlZGdlIGZsb3cgZnJvbSB7MH0gdG8gezF9IHRvIDBcIixlZGdlLlJlc3VsdEVkZ2UuRnJvbS5JZGVudGlmaWVyLGVkZ2UuUmVzdWx0RWRnZS5Uby5JZGVudGlmaWVyKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWRnZS5SZXN1bHRFZGdlLlNldEN1cnJlbnRGbG93KDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIENvbnNvbGUuV3JpdGVMaW5lKHN0cmluZy5Gb3JtYXQoXCJTZXR0aW5nIGVkZ2UgZmxvdyBmcm9tIHswfSB0byB7MX0gdG8gMVwiLGVkZ2UuUmVzdWx0RWRnZS5Gcm9tLklkZW50aWZpZXIsZWRnZS5SZXN1bHRFZGdlLlRvLklkZW50aWZpZXIpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBuZXh0Tm9kZSA9IGZsb3dQYXRoW25leHROb2RlXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBFZGdlSW5mbyBHZXRFZGdlSW5mbyhOb2RlIG5vZGUxLCBOb2RlIG5vZGUyKVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgRWRnZUluZm8gcmVzdWx0ID0gbmV3IEVkZ2VJbmZvKCk7XHJcbiAgICAgICAgICAgIEVkZ2UgZWRnID0gU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZT4obm9kZTEuT3V0cHV0RWRnZXMsKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93LkVkZ2UsIGJvb2w+KShlZGdlID0+IGVkZ2UuVG8gPT0gbm9kZTIpKS5GaXJzdE9yRGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAgICAgcmVzdWx0LklzRnJvbU5vZGUxVG9Ob2RlMiA9IGVkZyAhPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgaWYgKGVkZyA9PSBudWxsKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBlZGcgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlPihub2RlMS5JbnB1dEVkZ2VzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlLCBib29sPikoZWRnZSA9PiBlZGdlLkZyb20gPT0gbm9kZTIpKS5GaXJzdE9yRGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXN1bHQuUmVzdWx0RWRnZSA9IGVkZztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0cnVjdCBFZGdlSW5mb1xyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcHVibGljIEVkZ2UgUmVzdWx0RWRnZTtcclxuICAgICAgICAgICAgcHVibGljIGJvb2wgSXNGcm9tTm9kZTFUb05vZGUyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdHJ1Y3QgQXNzaWdubWVudFByZXZpZXdcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHB1YmxpYyBpbnQgdGltZVN0YXJ0O1xyXG4gICAgICAgICAgICBwdWJsaWMgaW50IGRheTtcclxuICAgICAgICAgICAgcHVibGljIFVzZXIgYXNzaWduZWRTdHVkZW50O1xyXG4gICAgICAgIH1cclxuXHJcblxyXG5cclxuICAgICAgICBwdWJsaWMgb3ZlcnJpZGUgc3RyaW5nIFRvU3RyaW5nKClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHN0cmluZyBjb21tYW5kID0gXCJncmFwaCBMUlxcclxcblwiO1xyXG5cclxuICAgICAgICAgICAgZm9yZWFjaCAoTm9kZSBuIGluIE5vZGVzKVxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBmb3JlYWNoIChFZGdlIG91dHB1dEVkZ2UgaW4gbi5PdXRwdXRFZGdlcylcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBjb21tYW5kICs9IHN0cmluZy5Gb3JtYXQoXCJ7MH0gLS0+fHsxfXwgezJ9XFxyXFxuXCIsb3V0cHV0RWRnZS5Gcm9tLklkZW50aWZpZXIsb3V0cHV0RWRnZS5HZXRDdXJyZW50RmxvdyhuZXcgTm9kZVswXSwgdGhpcyksb3V0cHV0RWRnZS5Uby5JZGVudGlmaWVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBjb21tYW5kO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvd1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgTm9kZVxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBlbnVtIE5vZGVUeXBlXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBEZWZhdWx0LFxyXG4gICAgICAgICAgICBJbnB1dCxcclxuICAgICAgICAgICAgT3V0cHV0XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RyaW5nIElkZW50aWZpZXI7XHJcbiAgICAgICAgcHVibGljIGludCBWYWx1ZTtcclxuXHJcbiAgICAgICAgcHVibGljIExpc3Q8RWRnZT4gSW5wdXRFZGdlcztcclxuICAgICAgICBwdWJsaWMgTGlzdDxFZGdlPiBPdXRwdXRFZGdlcztcclxuXHJcbiAgICAgICAgcHVibGljIE5vZGVUeXBlIFR5cGU7XHJcblxyXG4gICAgICAgIHB1YmxpYyBOb2RlKHN0cmluZyBpZGVudGlmaWVyLCBpbnQgdmFsdWUsIE5vZGVUeXBlIHR5cGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBJZGVudGlmaWVyID0gaWRlbnRpZmllcjtcclxuICAgICAgICAgICAgVmFsdWUgPSB2YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5UeXBlID0gdHlwZTtcclxuICAgICAgICAgICAgdGhpcy5JbnB1dEVkZ2VzID0gbmV3IExpc3Q8RWRnZT4oKTtcclxuICAgICAgICAgICAgdGhpcy5PdXRwdXRFZGdlcyA9IG5ldyBMaXN0PEVkZ2U+KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsInVzaW5nIFN5c3RlbTtcclxudXNpbmcgU3lzdGVtLkNvbGxlY3Rpb25zLkdlbmVyaWM7XHJcbnVzaW5nIFN5c3RlbS5MaW5xO1xyXG51c2luZyBTeXN0ZW0uVGV4dDtcclxudXNpbmcgU3lzdGVtLlRocmVhZGluZy5UYXNrcztcclxuXHJcbm5hbWVzcGFjZSBTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljXHJcbntcclxuICAgIHB1YmxpYyBjbGFzcyBVc2VyXHJcbiAgICB7XHJcbiAgICAgICAgcHVibGljIHN0cmluZyBuYW1lO1xyXG4gICAgICAgIHB1YmxpYyBib29sW10gZGF5c0F2YWlsYWJsZTtcclxuICAgICAgICBwdWJsaWMgaW50W10gbWludXRlc0Zyb21BdmFpbGFibGU7XHJcbiAgICAgICAgcHVibGljIGludFtdIG1pbnV0ZXNUb0F2YWlsYWJsZTtcclxuICAgICAgICBwdWJsaWMgaW50IGFzc2lnbmVkTWludXRlcyA9IC0xO1xyXG4gICAgICAgIHB1YmxpYyBpbnQgYXNzaWduZWREYXkgPSAtMTtcclxuICAgICAgICBwdWJsaWMgYm9vbCBhc3NpZ25lZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBwdWJsaWMgVXNlcihzdHJpbmcgbmFtZSwgYm9vbFtdIGRheXNBdmFpbGFibGUsIGludFtdIG1pbnV0ZXNGcm9tQXZhaWxhYmxlLCBpbnRbXSBtaW51dGVzVG9BdmFpbGFibGUpXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgICAgICB0aGlzLmRheXNBdmFpbGFibGUgPSBkYXlzQXZhaWxhYmxlO1xyXG4gICAgICAgICAgICB0aGlzLm1pbnV0ZXNGcm9tQXZhaWxhYmxlID0gbWludXRlc0Zyb21BdmFpbGFibGU7XHJcbiAgICAgICAgICAgIHRoaXMubWludXRlc1RvQXZhaWxhYmxlID0gbWludXRlc1RvQXZhaWxhYmxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHVibGljIHN0cmluZyBHZXRIb3Vyc0luRGF5KGludCBkYXlJbmRleClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGlmIChkYXlJbmRleCA8IDAgfHwgZGF5SW5kZXggPj0gNSlcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBBcmd1bWVudEV4Y2VwdGlvbihcIlBhcmFtZXRlciBNVVNUIEJFIGluIHJhbmdlIFswOyA1KS4gVmFsdWU6IFwiICsgZGF5SW5kZXgsIFwiZGF5SW5kZXhcIik7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWRheXNBdmFpbGFibGVbZGF5SW5kZXhdKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiTmVuw60gbmFzdGF2ZW5vXCI7XHJcblxyXG4gICAgICAgICAgICBpbnQgbWludXRlc0YgPSBtaW51dGVzRnJvbUF2YWlsYWJsZVtkYXlJbmRleF07XHJcbiAgICAgICAgICAgIGludCBtaW51dGVzVCA9IG1pbnV0ZXNUb0F2YWlsYWJsZVtkYXlJbmRleF07XHJcblxyXG4gICAgICAgICAgICBpbnQgaG91cnNGID0gKGludClNYXRoLkZsb29yKG1pbnV0ZXNGIC8gNjBkKTtcclxuICAgICAgICAgICAgaW50IGhvdXJzVCA9IChpbnQpTWF0aC5GbG9vcihtaW51dGVzVCAvIDYwZCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5nLkZvcm1hdChcIk9kIHswfTp7MX0gZG8gezJ9OnszfVwiLGhvdXJzRiwobWludXRlc0YgLSBob3Vyc0YgKiA2MCkuVG9TdHJpbmcoXCIwMFwiKSxob3Vyc1QsKG1pbnV0ZXNUIC0gaG91cnNUICogNjApLlRvU3RyaW5nKFwiMDBcIikpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJ1c2luZyBTeXN0ZW07XHJcbnVzaW5nIFN5c3RlbS5Db2xsZWN0aW9ucy5HZW5lcmljO1xyXG51c2luZyBTeXN0ZW0uTGlucTtcclxudXNpbmcgU3lzdGVtLlRleHQ7XHJcbnVzaW5nIFN5c3RlbS5UaHJlYWRpbmcuVGFza3M7XHJcblxyXG5uYW1lc3BhY2UgU3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvd1xyXG57XHJcbiAgICBwdWJsaWMgY2xhc3MgVGltZUNodW5rIDogRWRnZVxyXG4gICAge1xyXG4gICAgICAgIHB1YmxpYyBUaW1lQ2h1bmsoTm9kZSBmcm9tLCBOb2RlIHRvKSA6IGJhc2UoMCwgMCwgZnJvbSwgdG8pIHsgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGludCBHZXRCbG9ja2luZ05vZGVzKElFbnVtZXJhYmxlPE5vZGU+IHRpbWVOb2RlcywgRmxvdyBmbG93KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgSGFzaFNldDxOb2RlPiBibG9ja2luZ05vZGVzID0gbmV3IEhhc2hTZXQ8Tm9kZT4oKTtcclxuICAgICAgICAgICAgZm9yZWFjaChOb2RlIHRpbWVOb2RlIGluIHRpbWVOb2RlcylcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdmFyIGFub3RoZXJUaW1lTm9kZXMgPSBTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPihmbG93Lk5vZGVzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlLCBib29sPikobm9kZSA9PiBub2RlLlZhbHVlICE9IC0xICYmIG5vZGUgIT0gdGltZU5vZGUgJiYgU3lzdGVtLkxpbnEuRW51bWVyYWJsZS5XaGVyZTxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuRWRnZT4obm9kZS5JbnB1dEVkZ2VzLChnbG9iYWw6OlN5c3RlbS5GdW5jPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5FZGdlLCBib29sPikoZWRnZSA9PiBlZGdlLkdldEN1cnJlbnRGbG93KG51bGwsIG51bGwpID09IDEpKS5Db3VudCgpID09IDEpKTtcclxuICAgICAgICAgICAgICAgIHZhciBuZXdCbG9ja2luZ05vZGVzID0gYW5vdGhlclRpbWVOb2Rlcy5XaGVyZSgoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSwgYm9vbD4pKG5vZGUgPT4gTWF0aC5BYnModGltZU5vZGUuVmFsdWUgLSBub2RlLlZhbHVlKSA8IFBsYW4ubGVzc29uTGVuZ3RoKSk7XHJcbiAgICAgICAgICAgICAgICBuZXdCbG9ja2luZ05vZGVzLkZvckVhY2goKGdsb2JhbDo6U3lzdGVtLkZ1bmM8Z2xvYmFsOjpTdHVkZW50U2NoZWR1bGVyLkFwcExvZ2ljLk5ldHdvcmtGbG93Lk5vZGUsIGJvb2w+KShub2RlID0+IGJsb2NraW5nTm9kZXMuQWRkKG5vZGUpKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBibG9ja2luZ05vZGVzLkNvdW50O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8vIDxzdW1tYXJ5PlxyXG4gICAgICAgIC8vLyBcclxuICAgICAgICAvLy8gPC9zdW1tYXJ5PlxyXG4gICAgICAgIC8vLyA8cGFyYW0gbmFtZT1cImN1cnJlbnRQYXRoXCI+PC9wYXJhbT5cclxuICAgICAgICAvLy8gPHBhcmFtIG5hbWU9XCJmbG93XCI+PC9wYXJhbT5cclxuICAgICAgICAvLy8gPHJldHVybnM+TnVtYmVyIG9mIG5vZGVzIHRoYXQgYmxvY2sgY3VycmVudCBwYXRoPC9yZXR1cm5zPlxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSBpbnQgR2V0Q3VycmVudEZsb3coSUVudW1lcmFibGU8Tm9kZT4gY3VycmVudFBhdGgsIEZsb3cgZmxvdylcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGludCBibG9ja2luZ05vZGVzID0gR2V0QmxvY2tpbmdOb2RlcyhTeXN0ZW0uTGlucS5FbnVtZXJhYmxlLldoZXJlPGdsb2JhbDo6U3R1ZGVudFNjaGVkdWxlci5BcHBMb2dpYy5OZXR3b3JrRmxvdy5Ob2RlPihjdXJyZW50UGF0aCwoZ2xvYmFsOjpTeXN0ZW0uRnVuYzxnbG9iYWw6OlN0dWRlbnRTY2hlZHVsZXIuQXBwTG9naWMuTmV0d29ya0Zsb3cuTm9kZSwgYm9vbD4pKG5vZGUgPT4gbm9kZS5WYWx1ZSAhPSAtMSkpLCBmbG93KTtcclxuICAgICAgICAgICAgQ29uc29sZS5Xcml0ZUxpbmUoXCJDaGVja2luZyB0aW1lY2h1bmssIFwiICsgYmxvY2tpbmdOb2RlcyArIFwiIGJsb2NraW5nIG5vZGVzIGZvdW5kXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gYmxvY2tpbmdOb2RlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBvdmVycmlkZSB2b2lkIFNldEN1cnJlbnRGbG93KGludCBuZXdWYWx1ZSlcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIERvIG5vdGhpbmdcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIl0KfQo=
