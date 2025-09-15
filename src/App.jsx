import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "./components/ui/card.jsx";
import { Button } from "./components/ui/button.jsx";
import { Input } from "./components/ui/input.jsx";
import { Textarea } from "./components/ui/textarea.jsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog.jsx";
import { Badge } from "./components/ui/badge.jsx";
import { Label } from "./components/ui/label.jsx";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const LS_KEY = "coach_demo_app_v1";
function loadState(){
  try{ const raw = localStorage.getItem(LS_KEY); return raw? JSON.parse(raw) : null; }catch{ return null }
}
function saveState(state){ try{ localStorage.setItem(LS_KEY, JSON.stringify(state)); }catch{} }

const seedProgram = {
  id: "p1",
  title: "Upper Body – Hypertrophy",
  phase: "Block A (6–8 Wdh)",
  exercises: [
    { id:"e1", name:"Chest Press Machine", repRange:"6–8", sets:2, videoUrl:"https://www.youtube.com/watch?v=IODxDxX7oi4", notes:"Scapula stabil, volle ROM, 1–2 RIR" },
    { id:"e2", name:"T-Bar Row", repRange:"6–9", sets:2, videoUrl:"https://www.youtube.com/watch?v=QyX2S-yrQog", notes:"Ellenbogen führen, Oberer Rücken zielen" },
    { id:"e3", name:"Lat Pulldown", repRange:"8–10", sets:2, videoUrl:"https://www.youtube.com/watch?v=CAwf7n6Luuc", notes:"Schulter unten, Lats ansteuern" },
    { id:"e4", name:"Lateral Raise Machine", repRange:"10–12", sets:2, videoUrl:"https://www.youtube.com/watch?v=3VcKaXpzqRo", notes:"Konstante Spannung, kein Schwung" },
    { id:"e5", name:"Preacher Curl", repRange:"8–12", sets:2, videoUrl:"https://www.youtube.com/watch?v=gUy7z9B9J6Y", notes:"Vorderes Delt ruhig, volle Dehnung" },
  ]
};

export default function App(){
  const [program, setProgram] = useState(seedProgram);
  const [logs, setLogs] = useState([]);
  const [feedback, setFeedback] = useState([{ id:"f1", author:"coach", text:"Sieht solide aus. Tempo in der Exzentrik kontrollieren.", ts: new Date().toISOString() }]);
  const [activeExercise, setActiveExercise] = useState(program.exercises[0].id);
  const [day, setDay] = useState(()=> new Date().toISOString().slice(0,10));
  const [showVideo, setShowVideo] = useState(false);

  useEffect(()=>{
    const s = loadState();
    if(s){
      if(s.program) setProgram(s.program);
      if(s.logs) setLogs(s.logs);
      if(s.feedback) setFeedback(s.feedback);
      if(s.activeExercise) setActiveExercise(s.activeExercise);
      if(s.day) setDay(s.day);
    }
  },[]);

  useEffect(()=>{ saveState({ program, logs, feedback, activeExercise, day }); },[program, logs, feedback, activeExercise, day]);

  const active = useMemo(()=> program.exercises.find(e=>e.id===activeExercise), [program, activeExercise]);

  const chartData = useMemo(()=>{
    const exLogs = logs.filter(l=>l.exerciseId===activeExercise).sort((a,b)=> a.date.localeCompare(b.date));
    const byDate = new Map();
    for(const l of exLogs){
      const load = (Number(l.weight)||0) * (Number(l.reps)||0);
      const prev = byDate.get(l.date) || 0;
      byDate.set(l.date, Math.max(prev, load));
    }
    return Array.from(byDate.entries()).map(([date,load])=>({ date, load }));
  },[logs, activeExercise]);

  function addSetLog(){
    const setCountForDay = logs.filter(l=>l.exerciseId===activeExercise && l.date===day).length;
    const newLog = { date: day, exerciseId: activeExercise, set: setCountForDay + 1, weight: 0, reps: 0, rir: 1 };
    setLogs(prev=>[...prev, newLog]);
  }
  function updateLog(idx, patch){ setLogs(prev=> prev.map((l,i)=> i===idx? { ...l, ...patch } : l)); }
  function removeLog(idx){ setLogs(prev=> prev.filter((_,i)=> i!==idx)); }

  function addFeedbackItem({ text, videoUrl }){
    if(!text.trim() && !videoUrl){ alert("Bitte Text oder Video hinzufügen"); return; }
    const f = { id: String(Math.random()), author:"client", text, videoUrl, ts: new Date().toISOString() };
    setFeedback(prev=>[f, ...prev]);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid gap-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white grid place-items-center">🏋️</div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold">Coach-Client Demo</h1>
              <p className="text-sm text-gray-500">Übungen • Rep Range • Sets • Progression • Video • Feedback</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Input type="date" value={day} onChange={e=>setDay(e.target.value)} />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">Programm</h2>
                <span className="badge">{program.phase}</span>
              </div>
              <div className="text-sm text-gray-500">{program.title}</div>
              <div className="space-y-2">
                {program.exercises.map((e, i)=> (
                  <button key={e.id} onClick={()=>setActiveExercise(e.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between ${activeExercise===e.id? 'bg-white border-gray-300 shadow-sm' : 'bg-gray-100 border-transparent hover:bg-gray-200'}`}>
                    <div>
                      <div className="font-medium">{i+1}. {e.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="badge">{e.repRange} Wdh</span>
                        <span className="badge">{e.sets} Sätze</span>
                      </div>
                    </div>
                    <span className="opacity-60">›</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 grid gap-6">
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold">{active.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="badge">{active.repRange} Wdh</span>
                      <span className="badge">{active.sets} Sätze</span>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger>
                      <Button className="rounded-2xl" onClick={()=>setShowVideo(true)}>Video</Button>
                    </DialogTrigger>
                    {showVideo && (
                      <DialogContent>
                        <DialogHeader><DialogTitle>Technik-Video</DialogTitle></DialogHeader>
                        {active.videoUrl ? (
                          <div className="aspect-video w-full rounded-xl overflow-hidden">
                            <iframe src={active.videoUrl.replace("watch?v=","embed/")} title="Video" className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
                          </div>
                        ) : <p className="text-sm text-gray-500">Kein Video hinterlegt.</p>}
                        <div className="text-right mt-3">
                          <Button onClick={()=>setShowVideo(false)}>Schliessen</Button>
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                </div>

                <div className="grid gap-2">
                  <Label>Coach-Notiz</Label>
                  <Textarea defaultValue={active.notes||""} placeholder="Hinweise zur Ausführung, Tempo, Range, RIR …"
                    onBlur={(e)=> setProgram(p=>({ ...p, exercises: p.exercises.map(x=> x.id===active.id? { ...x, notes: e.target.value } : x)})) }/>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Satz-Tracking ({day})</h4>
                    <Button onClick={addSetLog} className="rounded-2xl">+ Satz hinzufügen</Button>
                  </div>
                  <div className="space-y-2">
                    {logs.map((l, idx)=> l.exerciseId===activeExercise && l.date===day && (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-gray-100 p-3 rounded-2xl">
                        <div className="col-span-2 text-sm"><span className="badge">Satz {l.set}</span></div>
                        <div className="col-span-3 flex items-center gap-2">
                          <Label className="text-xs">Gewicht</Label>
                          <Input type="number" inputMode="decimal" value={l.weight} onChange={e=>updateLog(idx, { weight: parseFloat
