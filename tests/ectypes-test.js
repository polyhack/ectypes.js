var ectypes = require('./../lib/ectypes')
  , should = require('should')
  , Faker = require('faker2')
  , SimpleStrategy = require('./simple-strategy');

var projectBlueprint = {
  Project: {
    title: function(){ return Faker.Name.findName() }
  }
};

var multiBlueprint = [
  {Person: {
    title: function(){ return Faker.Name.findName() }
  }}
  , {Ancestor: {
    title: function(){ return Faker.Name.findName() }
  }}
];

describe('configuring strategies', function(){
  var ctx;
  var projectBlueprint;

  beforeEach(function(){
    ctx = ectypes.createContext();

    var projectBlueprint = {
      Project: {
        title: function(){ return Faker.Name.findName() }
      }
    };
  });

  it('borks if you call ctx.add without setting a strategy', function(){
      try {
        ctx.add({Project: {}}); 
      }
      catch(err){
        err.toString().should.equal('Error: Ectypes - please set a default strategy on your context or an overriding _strategy in your blueprint.');
        should.exist(err);
      }
  });
});

describe('creating producers from blueprints', function(){
  var ctx;
  var projectBlueprint;
  var multiBlueprint;

  beforeEach(function(){
    ctx = ectypes.createContext();

    projectBlueprint = {
      Project: {
        title: function(){ return Faker.Name.findName() }
      }
    };

     multiBlueprint = [
      {Person: {
        title: function(){ return Faker.Name.findName() }
      }}
      , {Ancestor: {
        title: function(){ return Faker.Name.findName() }
      }}
    ];
   
  });


  beforeEach(function(){
    ctx = ectypes.createContext();
  })

  it('creates a producer for a single blueprinted Project', function(){
    ctx.load(new SimpleStrategy());
    ctx.add(projectBlueprint);
    should.exist(ctx.Project);
  }); 

  it('creates producers for an array of blueprints', function(){
    ctx.load(new SimpleStrategy());
    ctx.add(multiBlueprint);
    should.exist(ctx.Person);
    should.exist(ctx.Ancestor);
  });

  it('maps the strategies functions onto the producer', function(){
    ctx.load(new SimpleStrategy());
    ctx.add(projectBlueprint);
    should.exist(ctx.Project.build);
  });

  it('the build function on simpleStrategy called from the producer works', function(){
    ctx.load(new SimpleStrategy());
    ctx.add(projectBlueprint);

    var cb = function(err, project){
      should.exist(project.title);
    }

    ctx.Project.build(cb);
  });

  it('does not create ectype data before the producer function is called', function(){
    ctx.load(new SimpleStrategy());
    ctx.add(projectBlueprint);
    should.exist(ctx.Project);
  });
});


describe('overriding values', function(){
  var ctx;

  beforeEach(function(){
    ctx = ectypes.createContext();
    ctx.load(new SimpleStrategy());
    ctx.add(projectBlueprint);
  })


  it('without getting them confused with the cb', function(){
      var overrider = {title: 'was overridden'};
      var cb = function(err, project){
        project.title.should.equal('was overridden');       
      }

      ctx.Project.build(overrider, cb);
    });
  
    it('includes override fields which don\'t exist in the blueprint', function(){
      var overrider = {unblueprinted: 'should appear', title: 'was still overrdidden'};
      var cb = function(err, project){
        project.title.should.equal('was still overrdidden');
        should.exist(project.unblueprinted)
      }

      ctx.Project.build(overrider, cb);
    });
});



describe('dependencies', function(done){
  var ctx;
  var projectDependencyBlueprint;

  beforeEach(function(){
    ctx = ectypes.createContext();

    projectDependencyBlueprint = {
      Project: {
        befores:
          [function(cb){ 
            cb(null, {another_id: 13, some_id: 99});
          }
          ,function(ctx, cb){
            var next_id = ctx.some_id + 1;
            cb(null, {third_id: next_id}) 
          }]
        , title: function(){ return Faker.Name.findName() }
      }
    };

  })

  it('are run', function(done){
    ctx.load(new SimpleStrategy());
    ctx.add(projectDependencyBlueprint);

    ctx.Project.build( function(err, project){
      project.third_id.should.equal(100);
      done()
    });
  });
});


describe('blueprint functions can support callbacks', function(done){
  var ctx;
  var projectBlueprint;

  beforeEach(function(){
    ctx = ectypes.createContext();
    projectBlueprint = {
      Project: {
        befores: [function(cb){ cb(null, {name: 'fred'})}]
        , title: function(){ return Faker.Name.findName() }
      }
    };
  })

  it('detects and uses a blueprint callback', function(done){
    ctx.load(new SimpleStrategy());
    ctx.add(projectBlueprint);

    ctx.Project.build( function(err, project){
      project.name.should.equal('fred');
      done();
    })
  });
});

