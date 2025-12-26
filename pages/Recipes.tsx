
import React, { useState } from 'react';
import { storage } from '../services/mockData';
import { 
  BookOpen, 
  Beer, 
  ChevronRight, 
  Plus, 
  Droplet, 
  X, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Thermometer, 
  Scale,
  ClipboardList,
  Flame,
  ListOrdered
} from 'lucide-react';
import { Recipe } from '../types';

const Recipes: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: 'kg' }]);
  const [steps, setSteps] = useState([{ title: '', description: '' }]);

  const recipes = storage.getRecipes();

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: 'kg' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddStep = () => {
    setSteps([...steps, { title: '', description: '' }]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    storage.addRecipe({ 
      name, 
      description: desc, 
      ingredients, 
      steps: steps.filter(s => s.title.trim() !== '') 
    });
    setShowAddModal(false);
    setName('');
    setDesc('');
    setIngredients([{ name: '', quantity: '', unit: 'kg' }]);
    setSteps([{ title: '', description: '' }]);
  };

  return (
    <>
      <div className="space-y-8 animate-gemini">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Recetas</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Catálogo de variedades y fórmulas maestros.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm shrink-0 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Nueva Receta
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="gemini-card rounded-4xl overflow-hidden group transition-all shadow-sm dark:bg-slate-800 dark:border-slate-700">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 flex items-center justify-center border border-amber-100/50 dark:border-amber-800/50">
                      <Beer className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white">{recipe.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-1">{recipe.description}</p>
                    </div>
                  </div>
                </div>

                <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Droplet className="w-3 h-3 text-primary" />
                  INGREDIENTES BASE
                </h4>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {recipe.ingredients.slice(0, 4).map((ing, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-900 px-4 py-3 rounded-2xl flex justify-between items-center border border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-bold truncate max-w-[80px]">{ing.name}</span>
                      <span className="text-xs font-bold text-primary dark:text-blue-400 whitespace-nowrap">{ing.quantity}{ing.unit}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setSelectedRecipe(recipe)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-full font-bold hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all text-sm border border-slate-100 dark:border-slate-800"
                >
                  Detalles de Producción
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Production Details Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 mx-4">
            <div className="px-10 pt-10 pb-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-start bg-white dark:bg-slate-800 shrink-0 relative">
              <div className="flex gap-5">
                <div className="w-16 h-16 rounded-3xl bg-primary-light dark:bg-primary/20 flex items-center justify-center text-primary dark:text-blue-400 shrink-0">
                  <ClipboardList className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedRecipe.name}</h2>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">FICHA TÉCNICA DE PRODUCCIÓN</p>
                  <div className="flex gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-primary" /> 6h Estimado
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRecipe(null)} 
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all"
              >
                <X className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              </button>
            </div>

            <div className="px-10 py-8 space-y-10 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/20 dark:bg-slate-900/20">
              {/* Ingredients Detailed List */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <Scale className="w-4 h-4 text-primary" />
                    Insumos Requeridos
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-3 py-1 rounded-full">
                    Total: {selectedRecipe.ingredients.length} items
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-bold">
                          {i + 1}
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{ing.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-primary dark:text-blue-400 font-black text-sm">{ing.quantity}</span>
                        <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">{ing.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Steps from data */}
              <section>
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-500" />
                  Proceso de Elaboración
                </h3>
                <div className="space-y-4">
                  {selectedRecipe.steps && selectedRecipe.steps.length > 0 ? (
                    selectedRecipe.steps.map((proc, i) => (
                      <div key={i} className="flex gap-5 group">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black group-last:bg-emerald-500 shrink-0">
                            {i + 1}
                          </div>
                          <div className="w-0.5 flex-1 bg-slate-100 dark:bg-slate-700 my-1 group-last:hidden" />
                        </div>
                        <div className="pb-6">
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">{proc.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{proc.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">No se ha definido un proceso paso a paso para esta receta.</p>
                  )}
                </div>
              </section>
            </div>

            <div className="px-10 py-6 border-t border-slate-100 dark:border-slate-700 flex gap-4 shrink-0 bg-white dark:bg-slate-800">
              <button 
                onClick={() => setSelectedRecipe(null)}
                className="flex-1 py-4 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                Cerrar Detalle
              </button>
              <button 
                className="flex-[2] py-4 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Iniciar Lote con esta Receta
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 dark:bg-black/60 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 mx-4">
            <div className="px-8 pt-8 pb-4 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 relative shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Nueva Receta</h2>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">FÓRMULA MAESTRA</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors group">
                <X className="w-6 h-6 text-slate-300 dark:text-slate-500 group-hover:text-slate-500 transition-colors" />
              </button>
            </div>
            <form onSubmit={handleSave} className="px-8 py-6 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
              {/* General Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">NOMBRE DE LA VARIEDAD</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: IPA Imperial" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">DESCRIPCIÓN CORTA</label>
                  <input required type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ej: Perfil amargo y cítrico" />
                </div>
              </div>

              {/* Ingredients List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Droplet className="w-3.5 h-3.5 text-primary" />
                    LISTADO DE INGREDIENTES
                  </h4>
                  <button type="button" onClick={handleAddIngredient} className="text-primary dark:text-blue-400 text-xs font-bold flex items-center gap-1 hover:underline">
                    <Plus className="w-3 h-3" /> Añadir Componente
                  </button>
                </div>
                <div className="space-y-3">
                  {ingredients.map((ing, i) => (
                    <div key={i} className="flex gap-2 items-start group animate-in slide-in-from-left-2 duration-200">
                      <div className="flex-1">
                        <input required placeholder="Nombre ingrediente" type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-sm font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none" value={ing.name} onChange={e => {
                          const newIngs = [...ingredients];
                          newIngs[i].name = e.target.value;
                          setIngredients(newIngs);
                        }} />
                      </div>
                      <div className="w-20">
                        <input required placeholder="Cant." type="text" className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-sm font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none text-center" value={ing.quantity} onChange={e => {
                          const newIngs = [...ingredients];
                          newIngs[i].quantity = e.target.value;
                          setIngredients(newIngs);
                        }} />
                      </div>
                      <div className="w-20">
                        <select className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-sm font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer" value={ing.unit} onChange={e => {
                          const newIngs = [...ingredients];
                          newIngs[i].unit = e.target.value;
                          setIngredients(newIngs);
                        }}>
                          <option value="kg">kg</option>
                          <option value="g">g</option>
                          <option value="l">l</option>
                          <option value="un">un</option>
                        </select>
                      </div>
                      <button type="button" onClick={() => handleRemoveIngredient(i)} className="p-4 text-rose-300 dark:text-rose-500/50 hover:text-rose-500 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center px-1">
                  <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <ListOrdered className="w-3.5 h-3.5 text-amber-500" />
                    PROCESO DE PRODUCCIÓN
                  </h4>
                  <button type="button" onClick={handleAddStep} className="text-amber-600 dark:text-amber-500 text-xs font-bold flex items-center gap-1 hover:underline">
                    <Plus className="w-3 h-3" /> Añadir Paso
                  </button>
                </div>
                <div className="space-y-4">
                  {steps.map((step, i) => (
                    <div key={i} className="flex gap-2 items-start group animate-in slide-in-from-left-2 duration-300">
                      <div className="flex-1 space-y-2">
                        <input 
                          placeholder="Título del paso (ej: Maceración)" 
                          type="text" 
                          className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none" 
                          value={step.title} 
                          onChange={e => {
                            const newSteps = [...steps];
                            newSteps[i].title = e.target.value;
                            setSteps(newSteps);
                          }} 
                        />
                        <textarea 
                          placeholder="Instrucciones detalladas..." 
                          className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 text-xs font-semibold text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none h-20 resize-none" 
                          value={step.description} 
                          onChange={e => {
                            const newSteps = [...steps];
                            newSteps[i].description = e.target.value;
                            setSteps(newSteps);
                          }} 
                        />
                      </div>
                      <button type="button" onClick={() => handleRemoveStep(i)} className="p-4 text-rose-300 dark:text-rose-500/50 hover:text-rose-500 dark:hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all mt-4 text-base active:scale-95 shrink-0">
                Guardar Receta Maestra
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Recipes;
