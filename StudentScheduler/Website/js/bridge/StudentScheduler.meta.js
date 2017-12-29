Bridge.assembly("StudentScheduler", function ($asm, globals) {
    "use strict";


    var $m = Bridge.setMetadata,
        $n = [System,StudentScheduler.AppLogic,System.Collections.Generic,StudentScheduler];
    $m($n[3].App, function () { return {"att":1048577,"a":2,"m":[{"a":2,"isSynthetic":true,"n":".ctor","t":1,"sn":"ctor"},{"a":1,"n":"AddNewStudent","is":true,"t":8,"pi":[{"n":"sender","pt":HTMLElement,"ps":0}],"sn":"AddNewStudent","rt":$n[0].Void,"p":[HTMLElement]},{"a":1,"n":"AddNewTeacher","is":true,"t":8,"pi":[{"n":"sender","pt":HTMLElement,"ps":0}],"sn":"AddNewTeacher","rt":$n[0].Void,"p":[HTMLElement]},{"a":1,"n":"EditHoursClick","is":true,"t":8,"pi":[{"n":"sender","pt":$n[0].Object,"ps":0},{"n":"wasTeacher","pt":$n[0].Boolean,"ps":1}],"sn":"EditHoursClick","rt":$n[0].Void,"p":[$n[0].Object,$n[0].Boolean]},{"a":1,"n":"Gcl","is":true,"t":8,"pi":[{"n":"cls","pt":$n[0].String,"ps":0}],"sn":"Gcl","rt":System.Array.type(HTMLElement),"p":[$n[0].String]},{"a":1,"n":"Gid","is":true,"t":8,"pi":[{"n":"id","pt":$n[0].String,"ps":0}],"sn":"Gid","rt":HTMLElement,"p":[$n[0].String]},{"a":2,"n":"Main","is":true,"t":8,"sn":"Main","rt":$n[0].Void},{"a":1,"n":"MinutesToHoursAndMinutes","is":true,"t":8,"pi":[{"n":"minutes","pt":$n[0].Int32,"ps":0}],"sn":"MinutesToHoursAndMinutes","rt":$n[0].String,"p":[$n[0].Int32]},{"a":1,"n":"MyNumberToStringWithAtLeastTwoDigitsFormatBecauseBridgeDotNetCannotDoThatSimpleTaskItself","is":true,"t":8,"pi":[{"n":"number","pt":$n[0].Int32,"ps":0}],"sn":"MyNumberToStringWithAtLeastTwoDigitsFormatBecauseBridgeDotNetCannotDoThatSimpleTaskItself","rt":$n[0].String,"p":[$n[0].Int32]},{"a":1,"n":"RemoveHourInDay","is":true,"t":8,"sn":"RemoveHourInDay","rt":$n[0].Void},{"a":1,"n":"SaveHourChange","is":true,"t":8,"sn":"SaveHourChange","rt":$n[0].Void},{"a":1,"n":"SomeDayEditHoursClick","is":true,"t":8,"pi":[{"n":"sender","pt":$n[0].Object,"ps":0}],"sn":"SomeDayEditHoursClick","rt":$n[0].Void,"p":[$n[0].Object]},{"a":1,"n":"UpdateListOfDays","is":true,"t":8,"sn":"UpdateListOfDays","rt":$n[0].Void},{"a":1,"n":"dayId","is":true,"t":4,"rt":$n[0].Int32,"sn":"dayId","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"days","is":true,"t":4,"rt":$n[0].Array.type(System.String),"sn":"days"},{"a":1,"n":"lastSelectedDay","is":true,"t":4,"rt":$n[0].Int32,"sn":"lastSelectedDay","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"lastSetId","is":true,"t":4,"rt":$n[0].Int32,"sn":"lastSetId","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":1,"n":"lastSetWasTeacher","is":true,"t":4,"rt":$n[0].Boolean,"sn":"lastSetWasTeacher","box":function ($v) { return Bridge.box($v, System.Boolean, System.Boolean.toString);}},{"a":1,"n":"plan","is":true,"t":4,"rt":$n[1].Plan,"sn":"plan"}]}; });
    $m($n[1].Plan, function () { return {"att":1048576,"a":4,"m":[{"a":2,"n":".ctor","t":1,"sn":"ctor"},{"a":2,"n":"Calc","t":8,"sn":"Calc","rt":$n[0].Object},{"a":2,"n":"students","t":4,"rt":$n[2].List$1(StudentScheduler.AppLogic.User),"sn":"students"},{"a":2,"n":"teachers","t":4,"rt":$n[2].List$1(StudentScheduler.AppLogic.User),"sn":"teachers"}]}; });
    $m($n[1].User, function () { return {"att":1048576,"a":4,"m":[{"a":2,"n":".ctor","t":1,"p":[$n[0].String,$n[0].Array.type(System.Boolean),$n[0].Array.type(System.Int32),$n[0].Array.type(System.Int32)],"pi":[{"n":"name","pt":$n[0].String,"ps":0},{"n":"daysAvailable","pt":$n[0].Array.type(System.Boolean),"ps":1},{"n":"minutesFromAvailable","pt":$n[0].Array.type(System.Int32),"ps":2},{"n":"minutesToAvailable","pt":$n[0].Array.type(System.Int32),"ps":3}],"sn":"ctor"},{"a":2,"n":"GetHoursInDay","t":8,"pi":[{"n":"dayIndex","pt":$n[0].Int32,"ps":0}],"sn":"GetHoursInDay","rt":$n[0].String,"p":[$n[0].Int32]},{"a":2,"n":"assignedConvertedMinutesFrom","t":4,"rt":$n[0].Int32,"sn":"assignedConvertedMinutesFrom","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"daysAvailable","t":4,"rt":$n[0].Array.type(System.Boolean),"sn":"daysAvailable"},{"a":2,"n":"hourLength","is":true,"t":4,"rt":$n[0].Int32,"sn":"hourLength","box":function ($v) { return Bridge.box($v, System.Int32);}},{"a":2,"n":"minutesFromAvailable","t":4,"rt":$n[0].Array.type(System.Int32),"sn":"minutesFromAvailable"},{"a":2,"n":"minutesToAvailable","t":4,"rt":$n[0].Array.type(System.Int32),"sn":"minutesToAvailable"},{"a":2,"n":"name","t":4,"rt":$n[0].String,"sn":"name"}]}; });
});
