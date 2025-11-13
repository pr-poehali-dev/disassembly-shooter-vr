import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface GunPart {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  removed: boolean;
  order: number;
}

interface WeaponConfig {
  id: string;
  name: string;
  icon: string;
  parts: GunPart[];
  difficulty: 'easy' | 'medium' | 'hard';
}

interface GameRecord {
  weapon: string;
  mode: string;
  time: number;
  score: number;
  date: string;
}

const WEAPONS: WeaponConfig[] = [
  {
    id: 'pistol',
    name: 'Пистолет Glock 17',
    icon: 'Zap',
    difficulty: 'easy',
    parts: [
      { id: 'magazine', name: 'Магазин', position: { x: 0, y: -40, z: 0 }, rotation: 0, removed: false, order: 1 },
      { id: 'slide', name: 'Затвор', position: { x: 0, y: 0, z: 0 }, rotation: 0, removed: false, order: 2 },
      { id: 'spring', name: 'Возвратная пружина', position: { x: 0, y: 10, z: 0 }, rotation: 0, removed: false, order: 3 },
      { id: 'barrel', name: 'Ствол', position: { x: 0, y: 15, z: 0 }, rotation: 0, removed: false, order: 4 },
      { id: 'frame', name: 'Рамка', position: { x: 0, y: 20, z: 0 }, rotation: 0, removed: false, order: 5 },
    ]
  },
  {
    id: 'rifle',
    name: 'Автомат AK-47',
    icon: 'Crosshair',
    difficulty: 'medium',
    parts: [
      { id: 'magazine', name: 'Магазин', position: { x: 0, y: -50, z: 0 }, rotation: 0, removed: false, order: 1 },
      { id: 'dustcover', name: 'Крышка ствольной коробки', position: { x: 0, y: -20, z: 0 }, rotation: 0, removed: false, order: 2 },
      { id: 'spring', name: 'Возвратный механизм', position: { x: 0, y: 0, z: 0 }, rotation: 0, removed: false, order: 3 },
      { id: 'carrier', name: 'Затворная рама', position: { x: 0, y: 10, z: 0 }, rotation: 0, removed: false, order: 4 },
      { id: 'bolt', name: 'Затвор', position: { x: 0, y: 20, z: 0 }, rotation: 0, removed: false, order: 5 },
      { id: 'gas', name: 'Газовая трубка', position: { x: 0, y: 30, z: 0 }, rotation: 0, removed: false, order: 6 },
      { id: 'barrel', name: 'Ствол', position: { x: 0, y: 40, z: 0 }, rotation: 0, removed: false, order: 7 },
    ]
  },
  {
    id: 'sniper',
    name: 'Снайперская винтовка',
    icon: 'Focus',
    difficulty: 'hard',
    parts: [
      { id: 'magazine', name: 'Магазин', position: { x: 0, y: -60, z: 0 }, rotation: 0, removed: false, order: 1 },
      { id: 'scope', name: 'Оптический прицел', position: { x: 0, y: -40, z: 0 }, rotation: 0, removed: false, order: 2 },
      { id: 'bolt', name: 'Затвор', position: { x: 0, y: -20, z: 0 }, rotation: 0, removed: false, order: 3 },
      { id: 'firingpin', name: 'Ударник', position: { x: 0, y: 0, z: 0 }, rotation: 0, removed: false, order: 4 },
      { id: 'spring', name: 'Боевая пружина', position: { x: 0, y: 10, z: 0 }, rotation: 0, removed: false, order: 5 },
      { id: 'trigger', name: 'Спусковой механизм', position: { x: 0, y: 20, z: 0 }, rotation: 0, removed: false, order: 6 },
      { id: 'barrel', name: 'Ствол', position: { x: 0, y: 30, z: 0 }, rotation: 0, removed: false, order: 7 },
      { id: 'stock', name: 'Приклад', position: { x: 0, y: 40, z: 0 }, rotation: 0, removed: false, order: 8 },
      { id: 'bipod', name: 'Сошки', position: { x: 0, y: 50, z: 0 }, rotation: 0, removed: false, order: 9 },
    ]
  }
];

const Index = () => {
  const [screen, setScreen] = useState<'menu' | 'game' | 'records'>('menu');
  const [gameMode, setGameMode] = useState<'disassembly' | 'assembly'>('disassembly');
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponConfig>(WEAPONS[0]);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [vrMode, setVrMode] = useState(false);
  const [records, setRecords] = useState<GameRecord[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  const [parts, setParts] = useState<GunPart[]>(selectedWeapon.parts);

  useEffect(() => {
    if (screen === 'game') {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen]);

  useEffect(() => {
    const saved = localStorage.getItem('weaponRecords');
    if (saved) {
      setRecords(JSON.parse(saved));
    }
  }, []);

  const startGame = (mode: 'disassembly' | 'assembly', weapon: WeaponConfig) => {
    setGameMode(mode);
    setSelectedWeapon(weapon);
    const resetParts = weapon.parts.map(p => ({ 
      ...p, 
      removed: mode === 'assembly', 
      position: mode === 'assembly' 
        ? { x: Math.cos(p.order * 60 * Math.PI / 180) * 200, y: p.order * 30, z: 50 }
        : { x: 0, y: p.order * 10 - 40, z: 0 }
    }));
    setParts(resetParts);
    setScreen('game');
    setCurrentStep(0);
    setTimer(0);
    setScore(0);
    setShowHint(false);
  };

  const handlePartClick = (part: GunPart) => {
    if (screen !== 'game' || (gameMode === 'disassembly' && part.removed) || (gameMode === 'assembly' && !part.removed)) return;

    if (part.order === currentStep + 1) {
      const angle = Math.random() * 360;
      const distance = 150 + Math.random() * 100;
      
      setParts(prevParts =>
        prevParts.map(p =>
          p.id === part.id
            ? {
                ...p,
                removed: gameMode === 'disassembly',
                position: gameMode === 'disassembly'
                  ? {
                      x: Math.cos(angle * Math.PI / 180) * distance,
                      y: p.position.y + Math.sin(angle * Math.PI / 180) * distance,
                      z: 50
                    }
                  : { x: 0, y: p.order * 10 - 40, z: 0 },
                rotation: gameMode === 'disassembly' ? angle : 0
              }
            : p
        )
      );
      
      setCurrentStep(prev => prev + 1);
      const timeBonus = Math.max(0, 200 - timer * 2);
      setScore(prev => prev + 100 + timeBonus);
      setShowHint(false);

      if (currentStep + 1 === parts.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        saveRecord();
      }
    }
  };

  const saveRecord = () => {
    const newRecord: GameRecord = {
      weapon: selectedWeapon.name,
      mode: gameMode === 'disassembly' ? 'Разборка' : 'Сборка',
      time: timer,
      score: score + 200,
      date: new Date().toLocaleDateString('ru-RU')
    };
    const updated = [...records, newRecord].sort((a, b) => b.score - a.score).slice(0, 10);
    setRecords(updated);
    localStorage.setItem('weaponRecords', JSON.stringify(updated));
  };

  const resetGame = () => {
    setScreen('menu');
    setCurrentStep(0);
    setTimer(0);
    setScore(0);
    setShowHint(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPart = parts.find(p => p.order === currentStep + 1);
  const progress = (currentStep / parts.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#221F26] to-[#1A1F2C] text-white overflow-x-hidden">
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Oswald:wght@600;700&display=swap" rel="stylesheet" />
      
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
            ОРУЖЕЙНЫЙ ТРЕНАЖЁР 3D
          </h1>
          <p className="text-[#8A898C] text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>
            Разборка и сборка огнестрельного оружия
          </p>
        </header>

        {screen === 'menu' && (
          <div className="max-w-6xl mx-auto animate-scale-in">
            <Tabs defaultValue="training" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-[#221F26]">
                <TabsTrigger value="training" className="data-[state=active]:bg-[#8B5CF6]">
                  <Icon name="Target" size={20} className="mr-2" />
                  Тренировка
                </TabsTrigger>
                <TabsTrigger value="weapons" className="data-[state=active]:bg-[#8B5CF6]">
                  <Icon name="Shield" size={20} className="mr-2" />
                  Оружие
                </TabsTrigger>
                <TabsTrigger value="records" className="data-[state=active]:bg-[#8B5CF6]">
                  <Icon name="Trophy" size={20} className="mr-2" />
                  Рекорды
                </TabsTrigger>
              </TabsList>

              <TabsContent value="training" className="animate-fade-in">
                <Card className="bg-[#221F26] border-[#8B5CF6] border-2 p-12 text-center">
                  <Icon name="Crosshair" size={80} className="mx-auto mb-6 text-[#8B5CF6]" />
                  <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>
                    ВЫБЕРИТЕ РЕЖИМ ТРЕНИРОВКИ
                  </h2>
                  
                  <div className="mb-8">
                    <label className="block text-sm text-[#8A898C] mb-3">Выберите оружие:</label>
                    <Select defaultValue="pistol" onValueChange={(id) => setSelectedWeapon(WEAPONS.find(w => w.id === id) || WEAPONS[0])}>
                      <SelectTrigger className="w-full max-w-md mx-auto bg-[#1A1F2C] border-[#8B5CF6]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1F2C] border-[#8B5CF6]">
                        {WEAPONS.map(weapon => (
                          <SelectItem key={weapon.id} value={weapon.id}>
                            {weapon.name} - {weapon.difficulty === 'easy' ? '⭐' : weapon.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div 
                      className="bg-[#1A1F2C] p-8 rounded-lg hover-scale cursor-pointer border-2 border-transparent hover:border-[#0EA5E9] transition-all"
                      onClick={() => startGame('disassembly', selectedWeapon)}
                    >
                      <Icon name="CircleMinus" size={60} className="mx-auto mb-4 text-[#0EA5E9]" />
                      <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>РАЗБОРКА</h3>
                      <p className="text-sm text-[#8A898C] mb-4">Разберите оружие на детали в правильном порядке</p>
                      <Badge variant="outline" className="border-[#0EA5E9] text-[#0EA5E9]">
                        {selectedWeapon.parts.length} деталей
                      </Badge>
                    </div>

                    <div 
                      className="bg-[#1A1F2C] p-8 rounded-lg hover-scale cursor-pointer border-2 border-transparent hover:border-[#D946EF] transition-all"
                      onClick={() => startGame('assembly', selectedWeapon)}
                    >
                      <Icon name="CirclePlus" size={60} className="mx-auto mb-4 text-[#D946EF]" />
                      <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>СБОРКА</h3>
                      <p className="text-sm text-[#8A898C] mb-4">Соберите оружие из деталей в правильной последовательности</p>
                      <Badge variant="outline" className="border-[#D946EF] text-[#D946EF]">
                        {selectedWeapon.parts.length} деталей
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 p-4 bg-[#1A1F2C] rounded-lg">
                    <Icon name="Glasses" size={32} className="text-[#F97316]" />
                    <div className="text-left">
                      <p className="font-semibold">VR-режим</p>
                      <p className="text-sm text-[#8A898C]">Включите для эффекта присутствия</p>
                    </div>
                    <Button
                      variant="outline"
                      className={`ml-auto ${vrMode ? 'bg-[#F97316] border-[#F97316]' : 'border-[#8A898C]'}`}
                      onClick={() => setVrMode(!vrMode)}
                    >
                      {vrMode ? 'Включен' : 'Выключен'}
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="weapons" className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {WEAPONS.map(weapon => (
                    <Card key={weapon.id} className="bg-[#221F26] border-[#8B5CF6] p-6 hover-scale">
                      <Icon name={weapon.icon as any} size={60} className="mx-auto mb-4 text-[#8B5CF6]" />
                      <h3 className="text-xl font-bold mb-2 text-center" style={{ fontFamily: 'Oswald, sans-serif' }}>
                        {weapon.name}
                      </h3>
                      <div className="flex justify-center gap-2 mb-4">
                        <Badge variant={weapon.difficulty === 'easy' ? 'default' : 'outline'} className="bg-[#0EA5E9]">
                          {weapon.difficulty === 'easy' && 'Легко'}
                          {weapon.difficulty === 'medium' && 'Средне'}
                          {weapon.difficulty === 'hard' && 'Сложно'}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-[#8A898C]">
                        <p>Деталей: {weapon.parts.length}</p>
                        <p>Режимы: Разборка, Сборка</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="records" className="animate-fade-in">
                <Card className="bg-[#221F26] border-[#8B5CF6] p-8">
                  <h2 className="text-3xl font-bold mb-6 text-center" style={{ fontFamily: 'Oswald, sans-serif' }}>
                    ТАБЛИЦА РЕКОРДОВ
                  </h2>
                  {records.length > 0 ? (
                    <div className="space-y-3">
                      {records.map((record, index) => (
                        <div key={index} className="bg-[#1A1F2C] p-4 rounded-lg flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                            index === 0 ? 'bg-[#D946EF]' : index === 1 ? 'bg-[#8B5CF6]' : index === 2 ? 'bg-[#0EA5E9]' : 'bg-[#8A898C]'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold">{record.weapon}</p>
                            <p className="text-sm text-[#8A898C]">{record.mode} • {record.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[#0EA5E9]">{record.score}</p>
                            <p className="text-sm text-[#8A898C]">{formatTime(record.time)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Icon name="Trophy" size={80} className="mx-auto mb-4 text-[#8A898C]" />
                      <p className="text-[#8A898C]">Пока нет рекордов. Начните тренировку!</p>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {screen === 'game' && (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-[#221F26] border-[#0EA5E9] p-6">
                <div className="flex items-center gap-3">
                  <Icon name="Clock" size={32} className="text-[#0EA5E9]" />
                  <div>
                    <p className="text-sm text-[#8A898C]">Время</p>
                    <p className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
                      {formatTime(timer)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-[#221F26] border-[#D946EF] p-6">
                <div className="flex items-center gap-3">
                  <Icon name="Trophy" size={32} className="text-[#D946EF]" />
                  <div>
                    <p className="text-sm text-[#8A898C]">Очки</p>
                    <p className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
                      {score}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-[#221F26] border-[#F97316] p-6">
                <div className="flex items-center gap-3">
                  <Icon name="ListChecks" size={32} className="text-[#F97316]" />
                  <div>
                    <p className="text-sm text-[#8A898C]">Прогресс</p>
                    <p className="text-3xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
                      {currentStep}/{parts.length}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-[#221F26] border-[#8B5CF6] p-6">
                <div className="flex items-center gap-3">
                  <Icon name="Crosshair" size={32} className="text-[#8B5CF6]" />
                  <div>
                    <p className="text-sm text-[#8A898C]">Режим</p>
                    <p className="text-xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
                      {gameMode === 'disassembly' ? 'Разборка' : 'Сборка'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <Progress value={progress} className="mb-6 h-3" />

            {currentStep < parts.length ? (
              <Card className="bg-[#221F26] border-[#8B5CF6] p-6 mb-6 animate-fade-in">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <Icon name="Target" size={40} className="text-[#8B5CF6]" />
                    <div>
                      <p className="text-sm text-[#8A898C] mb-1">
                        {gameMode === 'disassembly' ? 'Снять деталь:' : 'Установить деталь:'}
                      </p>
                      <p className="text-2xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>
                        {currentPart?.name}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white"
                    onClick={() => setShowHint(!showHint)}
                  >
                    <Icon name="Lightbulb" size={20} className="mr-2" />
                    {showHint ? 'Скрыть' : 'Подсказка'}
                  </Button>
                </div>
                {showHint && (
                  <div className="mt-4 p-4 bg-[#1A1F2C] rounded-lg border border-[#F97316] animate-fade-in">
                    <p className="text-sm text-[#F97316]">
                      💡 {gameMode === 'disassembly' 
                        ? `Нажмите на деталь "${currentPart?.name}" чтобы снять её`
                        : `Нажмите на деталь "${currentPart?.name}" чтобы установить её на место`
                      }
                    </p>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] border-0 p-8 mb-6 text-center animate-scale-in">
                <Icon name="Trophy" size={80} className="mx-auto mb-4" />
                <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  ОТЛИЧНАЯ РАБОТА!
                </h2>
                <p className="text-xl mb-4">
                  {gameMode === 'disassembly' ? 'Разборка' : 'Сборка'} завершена за {formatTime(timer)}
                </p>
                <p className="text-2xl font-bold mb-4">
                  Итоговый счёт: {score} очков
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="bg-white text-[#8B5CF6] hover:bg-gray-100"
                    onClick={resetGame}
                  >
                    В главное меню
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-[#8B5CF6]"
                    onClick={() => startGame(gameMode === 'disassembly' ? 'assembly' : 'disassembly', selectedWeapon)}
                  >
                    {gameMode === 'disassembly' ? 'Попробовать сборку' : 'Попробовать разборку'}
                  </Button>
                </div>
              </Card>
            )}

            <Card className={`bg-[#221F26] border-[#8B5CF6] p-8 mb-6 ${vrMode ? 'animate-pulse' : ''}`}>
              <div className="relative h-[500px] overflow-hidden" style={{ 
                perspective: vrMode ? '800px' : '1000px',
                transform: vrMode ? 'rotateX(5deg)' : 'none'
              }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full max-w-2xl h-full">
                    {parts.map((part) => (
                      <div
                        key={part.id}
                        onClick={() => handlePartClick(part)}
                        className={`absolute cursor-pointer transition-all duration-700 ease-out ${
                          ((gameMode === 'disassembly' && !part.removed) || (gameMode === 'assembly' && part.removed)) && part.order === currentStep + 1
                            ? 'animate-pulse ring-4 ring-[#0EA5E9] shadow-[0_0_30px_rgba(14,165,233,0.6)]' 
                            : ''
                        } ${
                          ((gameMode === 'disassembly' && !part.removed) || (gameMode === 'assembly' && part.removed))
                            ? 'hover-scale hover:ring-2 hover:ring-[#8B5CF6]' 
                            : ''
                        }`}
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: `translate(-50%, -50%) translate(${part.position.x}px, ${part.position.y}px) translateZ(${part.position.z}px) rotate(${part.rotation}deg)`,
                          opacity: (gameMode === 'disassembly' && part.removed) || (gameMode === 'assembly' && !part.removed) ? 0.4 : 1,
                          pointerEvents: ((gameMode === 'disassembly' && part.removed) || (gameMode === 'assembly' && !part.removed)) ? 'none' : 'auto',
                        }}
                      >
                        <div className={`bg-gradient-to-br ${
                          part.id.includes('magazine') ? 'from-[#666] to-[#333]' :
                          part.id.includes('slide') || part.id.includes('bolt') ? 'from-[#555] to-[#222]' :
                          part.id.includes('spring') ? 'from-[#888] to-[#555]' :
                          part.id.includes('barrel') ? 'from-[#777] to-[#444]' :
                          part.id.includes('scope') ? 'from-[#333] to-[#111]' :
                          'from-[#999] to-[#666]'
                        } rounded-lg shadow-2xl border-2 border-[#444] p-6 min-w-[180px] text-center`}>
                          <Icon 
                            name={
                              part.id.includes('magazine') ? 'Box' :
                              part.id.includes('slide') || part.id.includes('bolt') ? 'RectangleHorizontal' :
                              part.id.includes('spring') ? 'CircleDot' :
                              part.id.includes('barrel') ? 'Cylinder' :
                              part.id.includes('scope') ? 'Focus' :
                              part.id.includes('stock') ? 'Move' :
                              'Square'
                            } 
                            size={48} 
                            className="mx-auto mb-2" 
                          />
                          <p className="font-bold text-sm">{part.name}</p>
                          <p className="text-xs text-[#8A898C] mt-1">#{part.order}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                className="border-[#8A898C] text-white hover:bg-[#8A898C]"
                onClick={resetGame}
              >
                <Icon name="Home" size={20} className="mr-2" />
                Главное меню
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white"
                onClick={() => startGame(gameMode, selectedWeapon)}
              >
                <Icon name="RotateCcw" size={20} className="mr-2" />
                Заново
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
