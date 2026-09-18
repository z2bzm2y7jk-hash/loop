import type {Game} from './types';
import {library} from './library';

export type Complexity='simple'|'medium'|'advanced';
export type TeamType='individual'|'teams'|'rotating'|'flexible';
export type GameMetadata={minPlayers:number;maxPlayers:number;worksFor9:boolean;worksFor18:boolean;complexity:Complexity;teamType:TeamType;typicalExposureLow:number;typicalExposureHigh:number;riskMultiplier:number;tags:string[];supportsHandicaps:boolean;supportsPresses:boolean;supportsCarryovers:boolean;durationImpact:'none'|'brief'|'decisions'};

export const gameMetadata:Record<Game,GameMetadata>={
  Nassau:{minPlayers:2,maxPlayers:8,worksFor9:false,worksFor18:true,complexity:'medium',teamType:'flexible',typicalExposureLow:5,typicalExposureHigh:25,riskMultiplier:3,tags:['Classic','Team or individual','Presses'],supportsHandicaps:true,supportsPresses:true,supportsCarryovers:false,durationImpact:'brief'},
  Skins:{minPlayers:2,maxPlayers:8,worksFor9:true,worksFor18:true,complexity:'simple',teamType:'individual',typicalExposureLow:2,typicalExposureHigh:18,riskMultiplier:2,tags:['Every hole matters','Carryovers'],supportsHandicaps:true,supportsPresses:false,supportsCarryovers:true,durationImpact:'none'},
  Wolf:{minPlayers:3,maxPlayers:8,worksFor9:true,worksFor18:true,complexity:'advanced',teamType:'rotating',typicalExposureLow:6,typicalExposureHigh:35,riskMultiplier:5,tags:['Rotating teams','Every hole matters','Decisions'],supportsHandicaps:true,supportsPresses:false,supportsCarryovers:false,durationImpact:'decisions'},
  'Match Play':{minPlayers:2,maxPlayers:8,worksFor9:true,worksFor18:true,complexity:'simple',teamType:'individual',typicalExposureLow:2,typicalExposureHigh:20,riskMultiplier:2,tags:['Classic','Every hole matters'],supportsHandicaps:true,supportsPresses:false,supportsCarryovers:false,durationImpact:'none'},
  Sixes:{minPlayers:4,maxPlayers:4,worksFor9:false,worksFor18:true,complexity:'medium',teamType:'rotating',typicalExposureLow:5,typicalExposureHigh:20,riskMultiplier:2,tags:['Team battle','Rotating teams','Classic'],supportsHandicaps:false,supportsPresses:false,supportsCarryovers:false,durationImpact:'brief'},
  Vegas:{minPlayers:4,maxPlayers:4,worksFor9:true,worksFor18:true,complexity:'advanced',teamType:'teams',typicalExposureLow:8,typicalExposureHigh:50,riskMultiplier:5,tags:['Team battle','Every hole matters','Chaos'],supportsHandicaps:true,supportsPresses:false,supportsCarryovers:false,durationImpact:'brief'},
  Hammer:{minPlayers:2,maxPlayers:8,worksFor9:true,worksFor18:true,complexity:'advanced',teamType:'teams',typicalExposureLow:5,typicalExposureHigh:45,riskMultiplier:5,tags:['Team battle','Chaos','Decisions'],supportsHandicaps:true,supportsPresses:false,supportsCarryovers:false,durationImpact:'decisions'},
  Greenies:{minPlayers:2,maxPlayers:8,worksFor9:true,worksFor18:true,complexity:'simple',teamType:'individual',typicalExposureLow:2,typicalExposureHigh:10,riskMultiplier:1,tags:['Low stakes','Par 3s'],supportsHandicaps:false,supportsPresses:false,supportsCarryovers:false,durationImpact:'brief'},
  Birdies:{minPlayers:2,maxPlayers:8,worksFor9:true,worksFor18:true,complexity:'simple',teamType:'individual',typicalExposureLow:2,typicalExposureHigh:12,riskMultiplier:2,tags:['Low stakes','Every hole matters'],supportsHandicaps:false,supportsPresses:false,supportsCarryovers:false,durationImpact:'none'},
  Sandies:{minPlayers:2,maxPlayers:8,worksFor9:true,worksFor18:true,complexity:'simple',teamType:'individual',typicalExposureLow:2,typicalExposureHigh:10,riskMultiplier:2,tags:['Junk','Low stakes'],supportsHandicaps:false,supportsPresses:false,supportsCarryovers:false,durationImpact:'brief'},
  Snake:{minPlayers:2,maxPlayers:8,worksFor9:true,worksFor18:true,complexity:'simple',teamType:'individual',typicalExposureLow:2,typicalExposureHigh:8,riskMultiplier:2,tags:['Junk','Low stakes'],supportsHandicaps:false,supportsPresses:false,supportsCarryovers:false,durationImpact:'brief'},
  Dots:{minPlayers:2,maxPlayers:8,worksFor9:true,worksFor18:true,complexity:'simple',teamType:'individual',typicalExposureLow:2,typicalExposureHigh:10,riskMultiplier:2,tags:['Junk','Every hole matters'],supportsHandicaps:false,supportsPresses:false,supportsCarryovers:false,durationImpact:'brief'}
};

export const gameCatalog=library.map(game=>({...game,...gameMetadata[game.name]}));
export function gameFits(game:Game,players:number,holes:number){const meta=gameMetadata[game];return players>=meta.minPlayers&&players<=meta.maxPlayers&&(holes===9?meta.worksFor9:holes===18&&meta.worksFor18)}
