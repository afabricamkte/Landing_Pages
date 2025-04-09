/**
 * Sistema de Gestão de Eventos - Funções Utilitárias
 * Funções de uso geral em toda a aplicação
 */

/**
 * Gera um ID único (baseado em timestamp + random)
 * @returns {string} - ID gerado
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
  
  /**
   * Converte um objeto para FormData (para envio de arquivos)
   * @param {Object} obj - Objeto a ser convertido
   * @returns {FormData} - FormData gerado
   */
  export function objectToFormData(obj) {
    const formData = new FormData();
    
    Object.keys(obj).forEach(key => {
      // Se for um File ou Blob, adiciona diretamente
      if (obj[key] instanceof File || obj[key] instanceof Blob) {
        formData.append(key, obj[key]);
      } 
      // Se for objeto ou array, converte para JSON
      else if (typeof obj[key] === 'object' && obj[key] !== null) {
        formData.append(key, JSON.stringify(obj[key]));
      } 
      // Valores primitivos
      else {
        formData.append(key, obj[key]);
      }
    });
    
    return formData;
  }
  
  /**
   * Obtém a data atual no formato ISO (YYYY-MM-DD)
   * @returns {string} - Data formatada
   */
  export function getCurrentDate() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }
  
  /**
   * Obtém a data de N dias no futuro
   * @param {number} days - Número de dias a adicionar
   * @returns {string} - Data formatada em ISO (YYYY-MM-DD)
   */
  export function getFutureDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }
  
  /**
   * Calcula diferença em dias entre duas datas
   * @param {string|Date} date1 - Primeira data
   * @param {string|Date} date2 - Segunda data (padrão: data atual)
   * @returns {number} - Diferença em dias
   */
  export function daysBetween(date1, date2 = new Date()) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    // Normaliza as datas para meia-noite
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    
    // Calcula a diferença em milissegundos e converte para dias
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }
  
  /**
   * Debounce para limitar chamadas de função
   * @param {Function} func - Função a ser executada
   * @param {number} wait - Tempo de espera em ms
   * @returns {Function} - Função com debounce
   */
  export function debounce(func, wait = 300) {
    let timeout;
    
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  /**
   * Verifica se um email é válido
   * @param {string} email - Email a ser validado
   * @returns {boolean} - Verdadeiro se o email for válido
   */
  export function isValidEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  }
  
  /**
   * Agrupa array por propriedade
   * @param {Array} arr - Array a ser agrupado
   * @param {string|Function} key - Propriedade ou função para agrupar
   * @returns {Object} - Objeto agrupado
   */
  export function groupBy(arr, key) {
    return arr.reduce((result, item) => {
      const groupKey = typeof key === 'function' ? key(item) : item[key];
      // Se a chave não existe no resultado, inicializa com array vazio
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      // Adiciona o item ao grupo
      result[groupKey].push(item);
      return result;
    }, {});
  }
  
  export default {
    generateId,
    objectToFormData,
    getCurrentDate,
    getFutureDate,
    daysBetween,
    debounce,
    isValidEmail,
    groupBy
  };