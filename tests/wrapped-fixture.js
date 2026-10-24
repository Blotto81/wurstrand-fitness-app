'use strict';
if(!['localhost','127.0.0.1'].includes(location.hostname))throw Error('Local fixture only');
const HISTORIC_PLAYER_TOTALS={},HISTORIC_TOTALS={};
const supabaseClient={rpc(){throw Error('Fixture must not call production');}};
    function cleanLoadedEntries(rawEntries) {
      const mergedMap = {};

      rawEntries.forEach(e => {
        const key = `${e.date}_${e.person}`;

        if (!mergedMap[key]) {
          mergedMap[key] = { ...e };
          return;
        }

        const existing = mergedMap[key];

        existing.steps = Math.max(+existing.steps || 0, +e.steps || 0);
        existing.bike = Math.max(+existing.bike || 0, +e.bike || 0);
        existing.squats = Math.max(+existing.squats || 0, +e.squats || 0);
        existing.pushups = Math.max(+existing.pushups || 0, +e.pushups || 0);
        existing.exercise = existing.exercise || e.exercise;
      });

      return Object.values(mergedMap);
    }


const wrappedRows=[];for(let i=0;i<235;i++){const date=new Date(Date.UTC(2026,4,1+i)).toISOString().slice(0,10);for(const [j,person] of people.entries()){if(person==='Fabi'&&i!==120)continue;if(person==='Basti'&&i%4!==0)continue;if(person==='Thorsten'&&i%8===0)continue;wrappedRows.push({date,person,steps:3000+(i*283+j*927)%15000,bike:person==='Marian'?12+i%25:3+i%7,squats:15+i%6,pushups:i%12,exercise:i%3===0});}}
const snap={version:1,year:2026,through:'2026-12-23',players:people,entries:wrappedRows,dailys:people.flatMap((player,j)=>Array.from({length:30-j*7},(_,i)=>({player,daily_id:i,completed_date:'2026-10-'+String(1+i%23).padStart(2,'0')}))),bonuses:[{recipient:'Thorsten',gift_date:'2026-05-20',points:15}],games:[{kind:'uno',id:'1',player:'Basti',place:1,date:'2026-10-01'}],history:{}};
window.WRC_WRAPPED_FIXTURE={available:true,personal_available:true,team_available:true,server_date:'2026-12-31',cutoff:'2026-12-23',frozen_at:'2026-12-24T08:00:00Z',snapshot:snap};
