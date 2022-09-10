//var Crafty = require('/utilities/craftyjs');

/*MASTER TO DO:
    ****** BOTH PLAYERS' HIT FUNCTION RUNS AT SAME TIME?********
    setCollisionArea() {
        //Is this setting all collisions to one job zone class
        let job = this;
        let jobID = job.getID();


        [] Redo collision detection to be lighter.  Now we have a unique property type added for every destination
            [] Should temp Crafty boxes be made internal to the Person object?
            [] Where should they be cleaned up?
            [] Collision on imaginary areas(Social) * To visualise a "Collision" object's hitbox, use "WiredHitBox" or "SolidHitBox".

        [] Remove() reached destinations?

        [x] Merge JS out of HTML document
        [] Add CSS

        [] Check issue with all pop getting 5 move preferences
        [] Add semi-random 8 directional navigation in nextPointTowards() method
            *less deterministic than straight line
        [] Colision detection
        
        [] Clean & refactor

        [] Music


*/
crafty = Crafty.init(800,800, document.getElementById('game'));
crafty.bind("UpdateFrame", function () {

    document.getElementById("gtSec").innerHTML = Math.round(this.frame()/10);
    document.getElementById("gtMin").innerHTML = Math.round(this.frame()/600);
    if (document.getElementById("gtHour").innerHTML < (Math.round(this.frame()/3600) + 1) ) {
        document.getElementById("gtHour").innerHTML = Math.round(this.frame()/3600) + 1;}
    
    //console.log("DOES THIS WORK?!");
})
// Blue Prints
// Starting population
    const START_POPA = 15;
    const START_POPB = 80;
    const START_POPC = 120;
    const START_POPD = 95;

    let population = [];
    let workplaces = [];
    let schools    = [];


//GlobalData
//  keeps track of time.  adds things to the world
class GlobalData {
    constructor(gameTime, population, foodSupply, moneySupply) {
        this.gameTime = gameTime;
        this.population = population;
        this.foodSupply = foodSupply;
        this.moneySupply = moneySupply;
    }
}

class Zone {
    constructor(id, x, y, w, h) {

        this.id = id;
        this.area = {x: x, y: y, w: w, h: h};

    }

}
class Person {
    sprite;
    //directionOfTravel [x +/- &|| y+/-]
    directionOfTravel;
    //destination is a point or set of points(plan)
    destination;
    
    constructor(id, age, home, location, hungerLevel, locationHistory, inventory, intel) {
        this.id = id;
        this.age = age;
        this.home = home;
        this.location = location;

        this.hungerLevel = hungerLevel;
        this.locationHistory = locationHistory;
        this.inventory = inventory;
        //intel
        //    "school": [ [name, location], [name, location] ]
        //    "jobLoc": [ [name, location], [name, location] ],
        //    "group": ["xxxxxx"],
        //    "mvPrefs": givePeferences(),
        //    "actPrefs": ["xxxxxx"]
        this.intel = intel;

        this.staffList = ["Jobworked1"];

        /*
        var asprite = Crafty.e("2D, asprite, Canvas, Color, Collision")
        .attr({x: 400, y: 0, w: 30, h: 30})
        .asprite({x: 0, y: 0}, 4000, "smootherStep")
        .onHit('2D', function(hitDatas, isFirstCollision) { 
        //console.log("first time?", cxl);
             if (isFirstCollision) {
                this.asprite( {x: 300, y: 400}, 6000, "smootherStep" );
                console.log("green box colision active, first hit"); 
                //console.log("\n new x, new y dest:", this.asprite.x, this.asprite.y);
            }
        })      
        .color('#24dc18');
        */

        this.schedule = this.makeSchedule();

  
       
    }
    //mvPrefs:  
    //  to work
    //      [yes/no? time spent]
    //  to school
    //      [yes/no? time spent]
    //  back home (lose 1% fights in home radius)
    //  explore
    //      [yes/no?]
    //  social (merges with action prefs)
    //      move to areas of known people
    //  to food
    //      at what hunger level?

    //  Need to translate to a schedule() at beginning of sim, everyone gets their destinations based on prefs
    //      destination(x, y)
    //          bool reachedDestination
    //              update destination 
    //          too hungry?
    //              head to food
    //
    
    //get schedule() {
    //    What does this do that givePreferences doesnt?
    //          -Code is more readable
    //          -Player may eventually make their own schedule
    //          -
    //    return this.schedule;
    //}

    
    makeSchedule() {
        console.log("mvPrefs: ", this.intel["mvPrefs"]);
        console.log("actPrefs: ", this.intel["actPrefs"]);
        //console.log("MAKE SCHEDULE: \n Intel[mvPrefs]:", this.intel["mvPrefs"]);
        //from A -> B or A -> A.1 -> A.2 -> A.3
        //[work 60, school 20, home 10]
        let itinerary = [];

        //let mvPrefs = [ ["job", 0], ["school", 0], ["home", 0], ["explore", 0], ["social", 0] ];
        //let actionPrefs = [ ["social", 0], ["fight", 0], ["rest", 0] ];

        //for loop populates itenerary with a set of points (schedule/itinerary)

        for (let a = 0; a <= this.intel["mvPrefs"].length - 1; a++) {
            let tid = this.intel["mvPrefs"][a][2];   //[a][2], 2 = the quardinates of a point in this area

            let timeAtLoc = this.intel["mvPrefs"][a][1] * 100;
            //console.log("TID = ", tid);
            

            //let tempPropString = ('2D, Destination');
            itinerary.push( Crafty.e('2D, Destination').attr( {x: tid[0], y: tid[1], w: 2, h: 2, t: timeAtLoc} ) );
        }  

        //console.log("person ID:", this.id, "\nitinerary: ", itinerary);                                             

        //this.setDestination(itinerary);
        //console.log("itinerary raw before return:\n", itinerary);
        return itinerary;

    }

    setSprite() {
        let personData = this;

        this.sprite = Crafty.e("2D, asprite, Canvas, Color, Collision, Person, Delay")
            .attr( {id: this.id, x: this.location[0], y: this.location[1], w: 3, h: 3} )
            .asprite({x: this.schedule[0].x, y: this.schedule[0].y, reachAndWaitT: this.schedule[0].t}, 4000, "smootherStep")
        /*  .onHit(this.id.toString()+'Destination', function(hitDatas, isFirstCollision) { 
                console.log("personid + curlocation", id, location[0], location[1]);
                console.log("this.schedule within Person.sprite:", this.schedule);
            //console.log("first time?", cxl);
                //reached destination.  Pause x clock cycles, update .asprite to go to next location on schedule
                 if (isFirstCollision) {
                    console.log(hitDatas);
                    //made it to first location, swap it to back of list for tomorrow
                    //this.schedule.push(this.schedule.shift());
                    //update next location
                   // this.asprite( {x: 300, y: 400}, 6000, "smootherStep" );
                    //console.log("green box colision active, first hit"); 
                    //console.log("\n new x, new y dest:", this.asprite.x, this.asprite.y);
                }
            })  
        */  .onHit('Job', function(hitDatas, isFirstHit) { // on collision with bullets
                let jobID = hitDatas[0].obj.id;
                //log this line for debugging.  
                //--Prints for every single frame of collision.
                //console.log("PERSON %d LOGGED INTO WORKSITE", this.id, jobID);
    
                if (isFirstHit) {
                    console.log("PERSON %d LOGGED INTO WORKSITE", this.id)
                    let jobID = hitDatas[0].obj.id;
                    console.log("this is being sent to logEventStartTime() as a parameter for id ", jobID);
                    personData.logEventStartTime(jobID);
                    console.log(hitDatas[0]);
    
                    console.log("JOB- %s: %s's time clock: %f", jobID, ("JOHNNY00-" + hitDatas[0].obj.id), crafty.frame() );
                    
                }

            }, function(site) { 
                    let siteType = site.slice(0, site.length - 1);
                    console.log("from person: person is leaving interaction with building ", siteType);


                    personData.intel[siteType][site].push(crafty.frame());
                    console.log("JOHNNY%s's location data for %s", personData.id, siteType, personData.intel[siteType]);

                    let shiftCount = personData.intel[siteType][site].length - 1;
                    let timeWorked = (personData.intel[siteType][site][shiftCount]) - (personData.intel[siteType][site][shiftCount - 1]);
                    console.log("JOHNNY%s's Time worked: %s\nEarnings:  $%d", personData.id, timeWorked, (timeWorked * 18));
            })
            .onHit('Person', function(hitDatas, isFirstHit) { // on collision with bullets
                //let otherPersonID = hitDatas[0].obj.id;
                //log this line for debugging.  
                //--Prints for every single frame of collision.
                //console.log("PERSON %d LOGGED INTO WORKSITE", this.id, jobID);

    
                if (isFirstHit) {
                    let otherPersonID = hitDatas[0].obj.id;
                    //generate an action, compare with other person's action via action map
                    //generate action:

                    let rc = Math.floor(Math.random() * 100) + 1;
                    ;;;;(rc == this.actionPrefs)

                    console.log("JOHNNY00%d RAN INTO JOHNNY%d", this.id, otherPersonID );
                    console.log("this is being sent to logEventStartTime() as a parameter for id ", otherPersonID);
                    personData.logEventStartTime(otherPersonID);
                    console.log(hitDatas[0]);
    
                    console.log("INTERACTION- %s: %s's time clock: %f", otherPersonID , ("JOHNNY00-" + hitDatas[0].obj.id), crafty.frame() );
                    
                }

            }, function(id) { 

                    console.log("ID passed to exit interaction function is: ", id);
                    console.log("and activators social intel is", personData.intel["socialHist"]);

                    personData.intel["socialHist"][id].push(crafty.frame());

                    let cWithPerson = personData.intel["socialHist"][id].length - 1;
                    console.log("interaction over");

 
                    
                    
            })
            .bind("aspriteEnd", function(finishedasprite) {
                //console.log("REACHED DESTINATION: \n");
                //console.log("passed obj = ", finishedasprite["reachAndWaitT"]);
                //console.log("T IS: ", finishedasprite["reachAndWaitT"]);
                //console.log("asprite end. this.id = ", this.id);
                let nextLocation = population[this.id].nextDestination();
                //console.log("nextLocation = ", nextLocation);
                //console.log("sprite", sprite.id);
                //sets wait time for working & schooling, before next move
                
                this.delay( function() {
                //    console.log("inside delay function: asprite obj, x,y t = ", finishedasprite["x"], finishedasprite["y"], finishedasprite["reachAndWaitT"]);
                //    console.log("nextlocation.x? .y? T?", nextLocation.x, nextLocation.y );
                    this.asprite({x: nextLocation.x, y: nextLocation.y, reachAndWaitT: finishedasprite["reachAndWaitT"] }, 6000, "smootherStep" );
                }, finishedasprite["reachAndWaitT"] , 1);   //VISIBILITY OF finishedasprite[] ABOVE
                //update this.asprite["reachAndWaitT"]

            } )
            .color('#fbff00');
    }

    //reachedDestination()
    //  Called after a player reaches his destination coordinates
    //      -Stay at location for weighted preference time
    //      -Update nextLocation()



    //setDestination
    //afunction of make schedule that holds the logic of this.destination (where are we currently going)
    //                         gets its own function in case rerouting logic gets added later

    setDestination(itinerary) {
        //console.log("setDestination = ", itinerary[0]);
        this.destination = itinerary[0];  //first place in their pref/locale list
    }

    nextDestination() {
        let temp = [];
        //console.log("this.schedule in nextDestination:", this.schedule[0].x, this.schedule[0].y);
        this.schedule.push(this.schedule.shift());
        //console.log("this.schedule after shift", this.schedule[0].x, this.schedule[0].y);
        temp.push(this.schedule[0].x);
        temp.push(this.schedule[0].y);
        //console.log("this.schedule.y)
        return {x: this.schedule[0].x, y: this.schedule[0].y};
        
    }

    updateSchedule() {
        //console.log(typeof this);
        //console.log("prop names:", Object.getOwnPropertyNames(this));

         // console.log("aspriteend called?, this.schedule=", this.schedule[0]);
        //update destination
        this.sprite.asprite(this.schedule.push(this.schedule.shift()).x, this.schedule[0].y, 6000, "smootherStep" ); 
    }

    logEventStartTime(id) {
        console.log("id of thing we ran into is:", id);
        //schoolA becomes school - can use for lookup in intel table
        let siteType = isNaN(id)? id.slice(0, id.length-1): "socialHist";

        console.log("id.intel: ", this.id, this.intel);
        console.log("\nsite type from logEventTime() = ", siteType);
        this.intel[siteType][id]? 
            this.intel[siteType][id].push(crafty.frame()):
                this.intel[siteType][id] = [crafty.frame()]; 
    }
    //move()
    //a function of Destination
    //vector movement?  [x, y, speed]
    move() {
        if (JSON.stringify(this.location) == JSON.stringify(this.destination)) {this.schedule.push(this.schedule.shift());}
        this.location = nextPointTowards(this.location, this.destination);
        this.sprite.attr( {x: this.location[0], y: this.location[1], w: 2, h: 2} );

    }

    act() {

    }
}




class Job extends Zone {
    constructor(id, x, y, w, h, wage, ageLimit, staffList) {
        super(id, x, y, w, h);
        this.wage = wage;
        this.staffList = {id: [staffList]};
        this.ageLimit = ageLimit;
        


    }

    getID() {
        return this.id
    }

    setCollisionArea() {
        let job = this;
        let jobID = job.getID();
    
        this.collisionArea = Crafty.e('2D, Canvas, Color, Collision, Job')
        .attr( {id: jobID, x: this.area.x, y: this.area.y, w: this.area.w, h: this.area.h} )
        .color(jobID.includes('job')? '#f1af49': '#e249f1');
        //.ignoreHits('Destination')

        /*.onHit('Person', function(hitDatas, isFirstHit) { // on collision with bullets
            let empID = hitDatas[0].obj.id;
 
            if (isFirstHit) {
                let empID = hitDatas[0].obj.id;
                console.log("this is being sent to logEventStartTime() as a parameter for id ", empID);
                job.logEventStartTime(empID);
                console.log(hitDatas[0]);
 
                console.log("JOB- %s: %s's time clock: %f", jobID, ("JOHNNY00-" + hitDatas[0].obj.id), crafty.frame() );
                
            }  else if (!hitDatas) {
                punchOut(empID);
            }

        }, function (id) {
    
        //log punchout
        //console.log("punchOut() id:", jobID);
        //let workData = this._collisionHitResults.length - 1;
        //console.log("here is last collision data", this._collisionHitResults, workData);
        //let empID = this._collisionHitResults[workData].id;
        //console.log("here is ID of person leaving:", empID);
        console.log("ID OF LAST HIT PASSED INTO CALLBACKOFF FUNC", id);
        //console.log("Data sent to exitedColisionBox", this._collisionHitResults[]);
        //empID = population[dater[0].obj.id];
        console.log("%s's stafflist - person is leaving", jobID, job.staffList);
        job.staffList[id].push(crafty.frame());
        let shiftCount = job.staffList[id].length - 1;
        let timeWorked = (job.staffList[id][shiftCount]) - (job.staffList[id][shiftCount] - 1);
        console.log("Time worked:", timeWorked)
    } 

); */
    }

    /*
    logEventStartTime(..) 
        Triggered once a person enters the work area.
        Should record time punched in.

    */
    logEventStartTime(id) {
        console.log("fancy code for id:", id);
        this.staffList[id]? 
            this.staffList[id].push(crafty.frame()):
                this.staffList[id] = [crafty.frame()]; 
    }
    punchOut(id) {
            //log punchout
        console.log("punchOut() id:", jobID);
        //let workData = this._collisionHitResults.length - 1;
        //console.log("here is last collision data", this._collisionHitResults, workData);
        //let empID = this._collisionHitResults[workData].id;
        //console.log("here is ID of person leaving:", empID);

        //console.log("Data sent to exitedColisionBox", this._collisionHitResults[]);
        //empID = population[dater[0].obj.id];
        console.log("stafflist of place person is leaving", job.staffList);
        this.staffList[id].push(crafty.frame());
        let shiftCount = this.staffList[id].length - 1;
        let timeWorked = (this.staffList[id][shiftCount]) - (this.staffList[id][shiftCount] - 1);
        console.log("Time worked:", timeWorked)
    
    //pay worker
    
    job.calcWage()
    }


    //used to determine a person's pay, if dynamic
    calcWage(person) {

    }

}

class School extends Job{
            //id, x ,  y ,  w,  h, price, ageLimit, studentList, intel
    constructor(id, x, y, w, h, price, ageLimit, studentList, intel) {
        super(id, x, y, w, h, price, ageLimit, studentList);
        this.intel = intel;
        //var staffList inherited from Job class (actually a studentList)
        this.staffList = {id: [studentList]};

        //Collision area is being taken care of in the superclass
        //this.collisionArea = Crafty.e('2D, Canvas, Color, Collision')
         //   .attr(this.area)
          //  .color('#48864a');
    }

}
class Officer extends Person {
    constructor(id, age, location, job, hungerLevel, locationHistory, inventory, intel, officerStuff) {
        super(id, age, location, job, hungerLevel, locationHistory, inventory, intel);
        this.officerStuff = officerStuff;
    }
    checkPassport(passport) {
        if (!(this.location.zone == passport.zone)) {
            //send to jail, confiscate items
        }
        else {
            //nice thing
        }
    }
}

//class Zone {
//    constructor(x, y, w, h) {
//        this.area = {x: x, y: y, w: w, h: h};


function placeInHome(zone) {
    //console.log("place in home function, zoneA passed in.", zone.area.x, zone.area.y, zone.area.h, zone.area.w, zone.area.w);
    let x = Math.floor(Math.random() * zone.area.w) + zone.area.x;
    let y = Math.floor(Math.random() * zone.area.h) + zone.area.y;
    let home = {"zone:": zone, "location": [x, y]};
    
    //returning the full zone and not a pointer to their zone
    //will see if local navigation works
    return home;
}

//determine, through algo or AI, which point to go to next
//collision detection?
function nextPointTowards(currentLocation, destination) {
  //console.log("currentlocation", currentLocation, "destination ", destination);
    let clx = currentLocation[0];
    let cly = currentLocation[1];
    let dx = destination[0];
    let dy = destination[1];


    let xdir = dx - clx;
    let ydir = dy - cly;
  

    const ptVector = (d) => {
        if (d == 0) {return 0;}
        //console.log("d=", d);
        return d > 0 ? 1 : -1;
    }

    var nextPoint = [clx + ptVector(xdir), cly + ptVector(ydir)];

    return nextPoint;


}

function anyPointInArea(area) {
  
    //p
    let x = Math.floor(Math.random() * area.w) + area.x;
    let y = Math.floor(Math.random() * area.h) + area.y;
    let point = [x, y];

    return point;
}




function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

// preference list should map out a person's day, by ratio of time per activity
function givePreferences(job, school, home) {
    //console.log("givePreferences(home) home = ", home);
    //mvPrefs
    //[ [string Name, int weightedPercentage] ]
    let mvPrefs = 
    [ 
        ["job", 0, anyPointInArea(job.area)],
        ["school", 0, anyPointInArea(school.area)],
        ["home", 0, home.location],
        ["explore", 0, anyPointInArea({x: 0, y: 0, h: 800, w: 800})],
        ["social", 0, anyPointInArea({x: 0, y: 0, h: 800, w: 800})]
    ];
    let actionPrefs = [ ["fight", 0], ["join", 0], ["avoid", 0], ["share", 0] ];

    //0 - 5

    //no need to weight preferences now.  Just get them towards a destination.
    //once they reach 

    //how many prefs do you get?
    let howManyPrefs = Math.floor(Math.random() * mvPrefs.length) + 1;
    let weightedPref = Math.floor(Math.random() * mvPrefs.length);

    //shuffle prefs so we can take a unique set(prefs[0 -> howManyPrefs] of preferences) 
    shuffle(mvPrefs);

    let prefsChosen = mvPrefs.slice(0, howManyPrefs);


    //console.log("prefsChosen at time of slice & creation", prefsChosen);

    //console.log("how many prefs = ", howManyPrefs, "\nlength of mvPrefs = ", prefsChosen.length);

    let giveWeight = function(arr, len) {
        for (let a = 0, b = 100, tot = 0; a <= (len - 1); a++) {
            
            if (a == (len - 1)) {
                arr[a][1] = (100 - tot);
                return arr;
            } 
            //console.log("givepreferences() prefsChosen = ", prefsChosen, "\n a = ", a);
            //assign each pref a weight
            
            arr[a][1] = Math.floor(Math.random() * b) + 1;
            tot += arr[a][1];
            if (tot == 100) {
                return arr;
            }
            
            //console.log("one iteration passed at a = ", a);
            b -= arr[a][1];

        }
        return arr;
    }

    mvPrefs = giveWeight(prefsChosen, howManyPrefs);
    actionPrefs = giveWeight(actionPrefs, 4);

    return [mvPrefs, actionPrefs];
    
}




// collision detection
/*

//      IDEAS

//      Global.whereAmI(location)
            
            return (zone, [empty, school, job])

securityPolicyInfractionEvent function () {
    if (zoneA.x < player.x + player.w &&
        zoneA.x + zoneA.w > player.x &&
        zoneA.y < player.y + player.h &&
        zoneA.h + zoneA.y > player.y) {
        // collision detected!
        this.color("green");
    } else {
        // no collision
        this.color("blue");
    }

player.bind("EnterFrame", function () {
    if (zoneA.x < player.x + player.w &&
        zoneA.x + zoneA.w > player.x &&
        zoneA.y < player.y + player.h &&
        zoneA.h + zoneA.y > player.y) {
        // collision detected!
        this.color("green");
    } else {
        // no collision
        this.color("blue");
    }
});
*/
    //instantiate variables
    

    //          ZONES
    const zoneA = new Zone("zoneA", 0, 0, 400, 400);
    const zoneB = new Zone("zoneB", 400, 0, 400, 400);
    const zoneC = new Zone("zoneC", 0, 400, 400, 400);
    const zoneD = new Zone("zoneD", 400, 400, 400, 400);





    //const patient0 = new Person(1, {x: 30, y: 30, w: 5, h: 5});



    //draw map
        //zones
        var zoneAdraw = Crafty.e('2D, Canvas, Color')
            .attr(zoneA.area)
            .color('#F00');
        var zoneBdraw = Crafty.e('2D, Canvas, Color')
            .attr(zoneB.area)
            .color('#a7327c');
        //.fourway(200)
        var zoneCdraw = Crafty.e('2D, Canvas, Color')
            .attr(zoneC.area)
            .color('#7e8035');
            //.fourway(200);
        var zoneDdraw = Crafty.e('2D, Canvas, Color')
            .attr(zoneD.area)
            .color('#1a76ff');
            //.fourway(200);

                        //id, x, y, w, h, wage, ageLimit, staffList
        const resA = new Job("jobA", 100, 100, 50, 50, 5, 1, "BossA" );
        workplaces.push(resA);
        const resB = new Job("jobB", 600, 100, 100, 50, 10, 5, "BossB" );
        workplaces.push(resB);
        const resC = new Job("jobC", 200, 600, 80, 10, 10, 7, "BossC" );
        workplaces.push(resC);
        const resD = new Job("jobD", 600, 600, 120, 50, 10, 6, "BossD" );
        workplaces.push(resD);

        for (var workplace of workplaces) {
            workplace.setCollisionArea();
        }

                                                 //id, x ,  y ,  w,  h, price, ageLimit, studentList, intel
        const schoolA = new School("schoolA", 250, 250, 50, 50, 1, 200, "Johnny001", {"schoolIntel": 1});
        schools.push(schoolA);
        const schoolB = new School("schoolB", 710, 100, 30, 80, 16, 300, "Johnny002", {"schoolIntel": 2});
        schools.push(schoolB);
        const schoolC = new School("schoolC", 20, 450, 120, 120, 18, 300, "Johnny003", {"schoolIntel": 3});
        schools.push(schoolC);
        const schoolD = new School("schoolD", 560, 430, 160, 30, 19, 800,  "Johnny004", {"schoolIntel": 4});
        schools.push(schoolD);

        for (var school of schools) {
            school.setCollisionArea();
        }

        const fantasyLandZone = new Zone("fantasyLandZone", 350, 350, 100, 100);

        /*
        //Draw resources
        var resAdraw = Crafty.e('2D, Canvas, Color, Collision')
            .attr(resA.area)
            .color('#48864a');
        var resBdraw = Crafty.e('2D, Canvas, Color, Collision')
            .attr(resB.area)
            .color('#48864a');
        //.fourway(200)
        var resCdraw = Crafty.e('2D, Canvas, Color, Collision')
            .attr(resC.area)
            .color('#48864a');
            //.fourway(200);
        var resDdraw = Crafty.e('2D, Canvas, Color, Collision')
            .attr(resD.area) 
            .color('#48864a');
            //.fourway(200);    
    */

        //Draw work sites
        /*
        var schoolAdraw = Crafty.e('2D, Canvas, Color, Collision')
            .attr(schoolA.area)
            .color('#9bf8d4');
        var schoolBdraw = Crafty.e('2D, Canvas, Color, Collision')
            .attr(schoolB.area)
            .color('#9bf8d4');
        var schoolCdraw = Crafty.e('2D, Canvas, Color, Collision')
            .attr(schoolC.area)
            .color('#9bf8d4');
        var schoolDdraw = Crafty.e('2D, Canvas, Color, Collision')
            .attr(schoolD.area)
            .color('#9bf8d4');
        */


        //Draw Fantasy Land
        var fantasyLandZonedraw = Crafty.e('2D, Canvas, Color, Collision')
            .attr(fantasyLandZone.area)
            .color('#072222');
            //.onHit()
              
            
            
        //draw population
        //var per1 = Crafty.e('2D, Canvas, Color')
        //.attr({x: 20, y: 20, w: 5, h: 5})
        //.color('#ffcc33');

        var bbb = 440;
        var p1color = '#ffcc33';

        //per1
        //.attr({x: bbb, y: 20, w: 5, h: 5})
       // .color(p1color);


   
        //for(let a = 20, b = 20; a <= 1000; a+=.01, b+=.01) {
        //    per1.attr({x: a, y: b, w: 5, h: 5});
        //
        // Define a custom easing function: 2t^2 - t

        // }

        //var per2 = Crafty.e('2D, Canvas, Color')
        //.attr({x: 40, y: 40, w: 5, h: 5})
        //.color('#ffcc33');

  
    //*************************instantiate all players*******************************************
    //(id, age, home, location, hungerLevel, locationHistory, inventory, intel) {
    for (let a = 0; a < START_POPA; a++) {
        let age = Math.floor(Math.random() * 20);

        //placeInHome
        let home = placeInHome(zoneA);
        let location = home.location;
        //hungerLevel [howHungry, howMuchDoYouCare range(-30 to 70)]
        let hungerLevel = [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100) - 30];
        let locationHistory = [home.location];
        let inventory = {"food": 0, "money": 0, "passport": [zoneA.id]};
        let mvActPrefs = givePreferences(resA, schoolA, home);
        
        //  school and job intel are lists of locations
        let intel = {
            
        //let mvPrefs = [ ["job", 0], ["school", 0], ["home", 0], ["explore", 0], ["social", 0] ];
        "home": [ home.location ],
        "school": {id: schoolA.id, timeData: []},
        "job": {id: resA.id, timeData: []},
        "group": ["xxxxxx"],
        "mvPrefs": mvActPrefs[0],
        "actPrefs": mvActPrefs[1],
        "socialHist": {id: "MOM", timeData: []} 
        };

    //    constructor(id, age, home, location, hungerLevel, locationHistory, inventory, intel) {
        population.push(new Person(a, age, placeInHome(zoneA), location, hungerLevel, locationHistory, inventory, intel));
        population[a].setSprite();
        //console.log("PersonID: ", a," intel: \n", population[a]["intel"]);



}
 //instantiate all players loop


/*
    //(id, age, home, location, hungerLevel, locationHistory, inventory, intel) {
        for (let a = 0, b = 1; a < 4; a++, b += 20) {
            let age = Math.floor(Math.random() * 20);
    
            //placeInHome
            let home = [20+b, 20+b];
            let location = home;
            //hungerLevel [howHungry, howMuchDoYouCare range(-30 to 70)]
            let hungerLevel = [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100) - 30];
            let locationHistory = [home];
            let inventory = {"food": 0, "money": 0, "passport": [zoneA.id]};
            let mvActPrefs = 
                [ [ 
                        ["job", 20, [134, 109]],
                        ["school", 20, [295, 268]],
                        ["home", 20, home],
                        ["explore", 1, [300, 300]],
                        ["social", 1, [400, 400]]
                    ],
                    [ ["social", 0], ["fight", 0], ["rest", 0] ] ];
            
            //  school and job intel are lists of locations
            let intel = {
                
            //let mvPrefs = [ ["job", 0], ["school", 0], ["home", 0], ["explore", 0], ["social", 0] ];
                "home": [ home.location ],
                "school": {id: schoolA.id, timeData: []},
                "job": {id: resA.id, timeData: []},
                "group": ["xxxxxx"],
                "mvPrefs": mvActPrefs[0],
                "actPrefs": mvActPrefs[1]
            };
    
        //    constructor(id, age, home, location, hungerLevel, locationHistory, inventory, intel) {
            population.push(new Person(a, age, placeInHome(zoneA), location, hungerLevel, locationHistory, inventory, intel));
            population[a].setSprite();
            //console.log("PersonID: ", a," intel: \n", population[a]["intel"]);
    
    
    
    }
*/
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

    //game loop
/*
    for (let a = 0; a <= 1000; a++) {
        for (var b = 0; b < START_POPA; b++) {
                population[b].move();
                population[b].sprite.draw();
                sleep(6000).then(() => { sleep(6000).then(() => {  }) });
               
        }

    }
*/