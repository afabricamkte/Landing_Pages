/**
 * Sistema de Gestão de Eventos - Formatadores
 * Funções para formatação de dados na interface
 */

/**
 * Formata um valor para moeda brasileira
 * @param {number} value - Valor a ser formatado
 * @returns {string} - Valor formatado
 */
export function formatCurrency(value) {
    if (value === null || value === undefined) return 'R$ 0,00';
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    return numValue.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  }
  
  /**
   * Formata uma data para o formato brasileiro
   * @param {string} date - Data no formato ISO (YYYY-MM-DD)
   * @returns {string} - Data formatada (DD/MM/YYYY)
   */
  export function formatDate(date) {
    if (!date) return '';
    
    // Se for objeto Date, converte para string ISO
    if (date instanceof Date) {
      date = date.toISOString().split('T')[0];
    }
    
    const partes = date.split('-');
    if (partes.length !== 3) return date;
    
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  
  /**
   * Formata número de telefone
   * @param {string} phone - Número de telefone
   * @returns {string} - Telefone formatado
   */
  export function formatPhone(phone) {
    if (!phone) return '';
    
    // Remove caracteres não numéricos
    const numbers = phone.replace(/\D/g, '');
    
    // Verifica o tamanho para determinar o formato
    if (numbers.length === 11) {
      // Celular: (99) 99999-9999
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`;
    } else if (numbers.length === 10) {
      // Fixo: (99) 9999-9999
      return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 6)}-${numbers.substring(6)}`;
    }
    
    // Se não se encaixar nos padrões, retorna como está
    return phone;
  }
  
  /**
   * Formata números com separadores de milhar
   * @param {number} number - Número a ser formatado
   * @returns {string} - Número formatado
   */
  export function formatNumber(number) {
    if (number === null || number === undefined) return '0';
    
    return number.toLocaleString('pt-BR');
  }
  
  /**
   * Formata texto para tamanho máximo com ellipsis
   * @param {string} text - Texto a ser formatado
   * @param {number} maxLength - Tamanho máximo
   * @returns {string} - Texto formatado
   */
  export function truncateText(text, maxLength = 100) {
    if (!text) return '';
    
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength) + '...';
  }
  
  /**
   * Formata um status para exibição
   * @param {string} status - Status a ser formatado
   * @returns {Object} - Objeto com classe e texto formatado
   */
  export function formatStatus(status) {
    const statusMap = {
      'pending': { class: 'warning', text: 'Pendente' },
      'active': { class: 'success', text: 'Ativo' },
      'completed': { class: 'primary', text: 'Concluído' },
      'canceled': { class: 'danger', text: 'Cancelado' },
      'approved': { class: 'success', text: 'Aprovado' },
      'rejected': { class: 'danger', text: 'Rejeitado' },
      'paid': { class: 'success', text: 'Pago' },
      'overdue': { class: 'danger', text: 'Atrasado' }
    };
    
    return statusMap[status] || { class: 'secondary', text: status };
  }
  
  /**
   * Formata data e hora para exibição
   * @param {string} dateTime - Data e hora no formato ISO
   * @returns {string} - Data e hora formatadas
   */
  export function formatDateTime(dateTime) {
    if (!dateTime) return '';
    
    const date = new Date(dateTime);
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  export default {
    formatCurrency,
    formatDate,
    formatPhone,
    formatNumber,
    truncateText,
    formatStatus,
    formatDateTime
  }; // Exporta todas as funções de formatação