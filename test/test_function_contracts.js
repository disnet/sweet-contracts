var contracts = window['contracts-js'];
setupContracts(contracts)

var server = "server";
var client = "client";

module("Function Contracts");

test("checking id", function() {
    fun (Num) -> Num
    function id (x) {
	return x;
    }
    ok(id(3));
    raises(function() { id("foo"); });
});

test("multiple args for function contracts", function() {
    fun (Num, Str, Bool) -> Num
    function f1(a, b, c) { 
	return a + 1; 
    }

    fun (Num, Str, Bool) -> Str
    function f2(a, b, c) {
	return b + "fu";
    }

    fun (Num, Str, Bool) -> Str
    function f3(a, b, c) {
	return c;
    }

    equal(f1(22, "test", false), 23);
    equal(f2(22, "test", false), "testfu");
    raises(function() { f1("test", 22, false); }, "bad client");
    raises(function() { f1("22", test, false); }, "bad server");
});

test("optional args for functions", function() {
    fun (Num, (? Str)) -> Num
    var f = function (x, y) { return x; }

    ok(f(23), "single arg works");
    ok(f(23, "quxter"), "optional argument included");
    raises(function() { f(23, 23); }, "broke the optional arg contract");
    
    raises(function() {
	fun (Num, (? Str), Bool) -> Num
	function jazz(x, y, z) { return x; }
    }, "optional arg must come after all required args");
});

test("higher order functions", function() {
    var id = function(x) { return x; };

    fun ((Bool->Bool), Bool) -> Bool
    function pred(p, x) { return p(x); };

    ok(pred(id, true), "higher order works");
    raises(function () { pred(id, 42); }, "client broke contract");

    fun ((Bool->Str), Bool) -> Bool
    function pred_client_ho(p, x) { return p(x); }

    raises(function () { pred_client_ho(id, true); }, "client broke contract");
    raises(function () { 
	pred_client_ho(function(x) { return "foo"; }, true); 
    }, "server broke contract");
    
    fun ((Str->Bool), Bool) -> Bool
    function pred_server_ho(p, x) { return p(x); }
    
    raises(function () { pred_server_ho(id, true); }, 
	   "server broke contract");
});

test("dependent functions", function() {
    fun (Str) -> (!(args, r) -> { return args[0] === r; })
    function id(x) { return x; }

    ok(id("foo"), "id really is id");

    fun (Str) -> (!(args, r) -> { return arg[0] === r; })
    function not_id(x) { return x + "boo!"; }

    raises(function() { not_id("foo"); }, "violates dependent contract");
});

test("basic functions", function() {
    var id = function(x) { return x; };
    
    fun (Num) -> Num
    var idc = id;

    same(idc(4), 4, "id obeys contract");
    raises(function() { idc("rib"); }, "id breaks contract");
    
    fun (Num) --> Num
    var id_nonew = id;

    same(id_nonew(4), 4, "nonew obeys contract");
    raises(function() { new id_nonew(4); },
	   "nonew borks when called by new");

    raises(function() { id_nonew("foo"); }, 
	   "nonew breaks contract");
    raises(function() { new id_nonew("foo"); },
           "nonew breaks contract and called by new"); 
});

test("constructor contracts", function() {
    fun (Str) ==> (a: Str, b: Num)
    function good_ctor(s) { this.a = s; this.b = 23; }
    raises(function() { good_ctor("foo"); },
           "onlynew obeys contract but not called with new");
    ok(new good_ctor("foo"),
         "onlynew obeys contract and called by new");

    fun (Num) ==> (a: Str, b: Num)
    function bad_ctor(s) { this.a = 23; this.b = s; }
    raises(function() { new bad_ctor("foo"); } );
    
    // Do we want this??
    // var safe_ctor = guard(
    //     ctorSafe(Str, object({a: Str, b:Num})),
    //     function(s) { this.a = s; this.b = 42; });
    // ok(new safe_ctor("foo"), "can call with new");
    // ok((new safe_ctor("foo")).a, "can call with new and get prop");
    // ok(safe_ctor("foo"), "can call without new");

});

test("call/new have different contracts", function() {
    //this is pretty wild! do we want this?
});

test("this contract on functions", function() {
    //not implemented yet
});

test("can contract for both function + objects properties", function() {
    //not implemented yet
});



