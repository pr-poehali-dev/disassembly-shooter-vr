import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface GunPart {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: number;
  removed: boolean;
  order: number;
}

const Index = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const [parts, setParts] = useState<GunPart[]>([
    { id: 'magazine', name: 'Магазин', position: { x: 0, y: -40, z: 0 }, rotation: 0, removed: false, order: 1 },
    { id: 'slide', name: 'Затвор', position: { x: 0, y: 0, z: 0 }, rotation: 0, removed: false, order: 2 },
    { id: 'spring', name: 'Возвратная пружина', position: { x: 0, y: 10, z: 0 }, rotation: 0, removed: false, order: 3 },
    { id: 'barrel', name: 'Ствол', position: { x: 0, y: 15, z: 0 }, rotation: 0, removed: false, order: 4 },
    { id: 'frame', name: 'Рамка', position: { x: 0, y: 20, z: 0 }, rotation: 0, removed: false, order: 5 },
  ]);

  useEffect(() => {
    if (gameStarted) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted]);

  const startGame = () => {
    setGameStarted(true);
    setCurrentStep(0);
    setTimer(0);
    setScore(0);
    setParts(parts.map(p => ({ ...p, removed: false, position: { 
      x: 0, 
      y: p.id === 'magazine' ? -40 : p.id === 'slide' ? 0 : p.id === 'spring' ? 10 : p.id === 'barrel' ? 15 : 20, 
      z: 0 
    }})));
  };

  const handlePartClick = (part: GunPart) => {
    if (!gameStarted || part.removed) return;

    if (part.order === currentStep + 1) {
      const angle = Math.random() * 360;
      const distance = 150 + Math.random() * 100;
      
      setParts(prevParts =>
        prevParts.map(p =>
          p.id === part.id
            ? {
                ...p,
                removed: true,
                position: {
                  x: Math.cos(angle * Math.PI / 180) * distance,
                  y: p.position.y + Math.sin(angle * Math.PI / 180) * distance,
                  z: 50
                },
                rotation: angle
              }
            : p
        )
      );
      
      setCurrentStep(prev => prev + 1);
      setScore(prev => prev + 100);
      setShowHint(false);

      if (currentStep + 1 === parts.length) {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentStep(0);
    setTimer(0);
    setScore(0);
    setShowHint(false);
    setParts(parts.map(p => ({ ...p, removed: false })));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPart = parts.find(p => p.order === currentStep + 1);
  const progress = (currentStep / parts.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#221F26] to-[#1A1F2C] text-white">
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

        {!gameStarted ? (
          <div className="max-w-4xl mx-auto animate-scale-in">
            <Card className="bg-[#221F26] border-[#8B5CF6] border-2 p-12 text-center">
              <div className="mb-8">
                <Icon name="Target" size={80} className="mx-auto mb-6 text-[#8B5CF6]" />
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Oswald, sans-serif' }}>
                  ТРЕНИРОВОЧНЫЙ РЕЖИМ
                </h2>
                <p className="text-[#8A898C] text-lg mb-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Изучите последовательность разборки пистолета. Нажимайте на детали в правильном порядке.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#1A1F2C] p-6 rounded-lg hover-scale">
                  <Icon name="Clock" size={40} className="mx-auto mb-3 text-[#0EA5E9]" />
                  <h3 className="font-semibold mb-2">Таймер</h3>
                  <p className="text-sm text-[#8A898C]">Засекайте время разборки</p>
                </div>
                <div className="bg-[#1A1F2C] p-6 rounded-lg hover-scale">
                  <Icon name="Lightbulb" size={40} className="mx-auto mb-3 text-[#F97316]" />
                  <h3 className="font-semibold mb-2">Подсказки</h3>
                  <p className="text-sm text-[#8A898C]">Получайте помощь при затруднении</p>
                </div>
                <div className="bg-[#1A1F2C] p-6 rounded-lg hover-scale">
                  <Icon name="Trophy" size={40} className="mx-auto mb-3 text-[#D946EF]" />
                  <h3 className="font-semibold mb-2">Очки</h3>
                  <p className="text-sm text-[#8A898C]">Зарабатывайте баллы за скорость</p>
                </div>
              </div>

              <Button 
                size="lg" 
                className="bg-[#8B5CF6] hover:bg-[#7E69AB] text-white px-12 py-6 text-xl font-bold transition-all hover-scale"
                onClick={startGame}
              >
                <Icon name="Play" size={24} className="mr-2" />
                НАЧАТЬ ТРЕНИРОВКУ
              </Button>
            </Card>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
            </div>

            <Progress value={progress} className="mb-6 h-3" />

            {currentStep < parts.length ? (
              <Card className="bg-[#221F26] border-[#8B5CF6] p-6 mb-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Icon name="Target" size={40} className="text-[#8B5CF6]" />
                    <div>
                      <p className="text-sm text-[#8A898C] mb-1">Следующая деталь:</p>
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
                      💡 Нажмите на деталь "{currentPart?.name}" на 3D-модели ниже
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
                  Разборка завершена за {formatTime(timer)}
                </p>
                <p className="text-2xl font-bold">
                  Итоговый счёт: {score} очков
                </p>
              </Card>
            )}

            <Card className="bg-[#221F26] border-[#8B5CF6] p-8 mb-6">
              <div className="relative h-[500px] overflow-hidden" style={{ perspective: '1000px' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-full max-w-2xl h-full">
                    {parts.map((part) => (
                      <div
                        key={part.id}
                        onClick={() => handlePartClick(part)}
                        className={`absolute cursor-pointer transition-all duration-700 ease-out ${
                          !part.removed && part.order === currentStep + 1 
                            ? 'animate-pulse ring-4 ring-[#0EA5E9] shadow-[0_0_30px_rgba(14,165,233,0.6)]' 
                            : ''
                        } ${!part.removed ? 'hover-scale hover:ring-2 hover:ring-[#8B5CF6]' : ''}`}
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: `translate(-50%, -50%) translate(${part.position.x}px, ${part.position.y}px) translateZ(${part.position.z}px) rotate(${part.rotation}deg)`,
                          opacity: part.removed ? 0.4 : 1,
                          pointerEvents: part.removed ? 'none' : 'auto',
                        }}
                      >
                        <div className={`bg-gradient-to-br ${
                          part.id === 'magazine' ? 'from-[#666] to-[#333]' :
                          part.id === 'slide' ? 'from-[#555] to-[#222]' :
                          part.id === 'spring' ? 'from-[#888] to-[#555]' :
                          part.id === 'barrel' ? 'from-[#777] to-[#444]' :
                          'from-[#999] to-[#666]'
                        } rounded-lg shadow-2xl border-2 border-[#444] p-6 min-w-[180px] text-center`}>
                          <Icon 
                            name={
                              part.id === 'magazine' ? 'Box' :
                              part.id === 'slide' ? 'RectangleHorizontal' :
                              part.id === 'spring' ? 'CircleDot' :
                              part.id === 'barrel' ? 'Cylinder' :
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
