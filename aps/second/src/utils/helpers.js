/**
 * Funções Utilitárias Gerais
 * Helpers e utilitários usados em todo o sistema
 */

import { TIMEOUTS } from './constants.js';

/**
 * Formata valor monetário para exibição
 */
export function formatCurrency(value, currency = 'BRL') {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency
    }).format(num);
}

/**
 * Formata número para exibição
 */
export function formatNumber(value, decimals = 2) {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
}

/**
 * Formata data para exibição
 */
export function formatDate(date, format = 'short') {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const options = {
        short: { day: '2-digit', month: '2-digit', year: 'numeric' },
        long: { day: '2-digit', month: 'long', year: 'numeric' },
        time: { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }
    };
    
    return d.toLocaleDateString('pt-BR', options[format] || options.short);
}

/**
 * Formata data e hora para exibição
 */
export function formatDateTime(date) {
    return formatDate(date, 'time');
}

/**
 * Converte data para formato ISO (YYYY-MM-DD)
 */
export function toISODate(date) {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toISOString().split('T')[0];
}

/**
 * Obtém data atual no formato ISO
 */
export function getCurrentDate() {
    return toISODate(new Date());
}

/**
 * Obtém timestamp atual
 */
export function getCurrentTimestamp() {
    return new Date().toISOString();
}

/**
 * Calcula diferença em dias entre duas datas
 */
export function daysDifference(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Verifica se uma data é hoje
 */
export function isToday(date) {
    const today = new Date();
    const checkDate = new Date(date);
    
    return today.toDateString() === checkDate.toDateString();
}

/**
 * Verifica se uma data é desta semana
 */
export function isThisWeek(date) {
    const today = new Date();
    const checkDate = new Date(date);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return checkDate >= startOfWeek && checkDate <= endOfWeek;
}

/**
 * Verifica se uma data é deste mês
 */
export function isThisMonth(date) {
    const today = new Date();
    const checkDate = new Date(date);
    
    return today.getMonth() === checkDate.getMonth() && 
           today.getFullYear() === checkDate.getFullYear();
}

/**
 * Gera ID único
 */
export function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

/**
 * Gera ID numérico único
 */
export function generateNumericId() {
    return Date.now();
}

/**
 * Debounce function
 */
export function debounce(func, wait = TIMEOUTS.DEBOUNCE_SEARCH) {
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
 * Throttle function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Capitaliza primeira letra
 */
export function capitalize(str) {
    if (!str || typeof str !== 'string') return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Converte para title case
 */
export function toTitleCase(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}

/**
 * Remove acentos de string
 */
export function removeAccents(str) {
    if (!str || typeof str !== 'string') return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Converte string para slug
 */
export function slugify(str) {
    if (!str || typeof str !== 'string') return '';
    return removeAccents(str)
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
}

/**
 * Trunca texto
 */
export function truncate(str, length = 50, suffix = '...') {
    if (!str || typeof str !== 'string') return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
}

/**
 * Escapa HTML
 */
export function escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Copia texto para clipboard
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (err) {
            document.body.removeChild(textArea);
            return false;
        }
    }
}

/**
 * Download de arquivo
 */
export function downloadFile(content, filename, contentType = 'text/plain') {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

/**
 * Lê arquivo como texto
 */
export function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

/**
 * Lê arquivo como JSON
 */
export async function readFileAsJSON(file) {
    const text = await readFileAsText(file);
    return JSON.parse(text);
}

/**
 * Converte array para CSV
 */
export function arrayToCSV(data, headers = null) {
    if (!Array.isArray(data) || data.length === 0) return '';
    
    const csvHeaders = headers || Object.keys(data[0]);
    const csvRows = data.map(row => 
        csvHeaders.map(header => {
            const value = row[header] || '';
            // Escapa aspas duplas e envolve em aspas se necessário
            const escaped = String(value).replace(/"/g, '""');
            return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
        }).join(',')
    );
    
    return [csvHeaders.join(','), ...csvRows].join('\n');
}

/**
 * Converte CSV para array
 */
export function csvToArray(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    
    return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim() || '';
        });
        return obj;
    });
}

/**
 * Ordena array por propriedade
 */
export function sortBy(array, property, direction = 'asc') {
    if (!Array.isArray(array)) return [];
    
    return [...array].sort((a, b) => {
        const aVal = a[property];
        const bVal = b[property];
        
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Agrupa array por propriedade
 */
export function groupBy(array, property) {
    if (!Array.isArray(array)) return {};
    
    return array.reduce((groups, item) => {
        const key = item[property];
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {});
}

/**
 * Filtra array por múltiplos critérios
 */
export function filterBy(array, filters) {
    if (!Array.isArray(array)) return [];
    
    return array.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
            if (value === '' || value === null || value === undefined) return true;
            
            const itemValue = item[key];
            if (typeof value === 'string') {
                return String(itemValue).toLowerCase().includes(value.toLowerCase());
            }
            
            return itemValue === value;
        });
    });
}

/**
 * Busca em array por texto
 */
export function searchInArray(array, searchText, searchFields) {
    if (!Array.isArray(array) || !searchText) return array;
    
    const search = searchText.toLowerCase();
    
    return array.filter(item => {
        return searchFields.some(field => {
            const value = item[field];
            return String(value).toLowerCase().includes(search);
        });
    });
}

/**
 * Remove duplicatas de array
 */
export function removeDuplicates(array, key = null) {
    if (!Array.isArray(array)) return [];
    
    if (key) {
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) return false;
            seen.add(value);
            return true;
        });
    }
    
    return [...new Set(array)];
}

/**
 * Calcula soma de propriedade em array
 */
export function sumBy(array, property) {
    if (!Array.isArray(array)) return 0;
    
    return array.reduce((sum, item) => {
        const value = parseFloat(item[property]) || 0;
        return sum + value;
    }, 0);
}

/**
 * Calcula média de propriedade em array
 */
export function averageBy(array, property) {
    if (!Array.isArray(array) || array.length === 0) return 0;
    
    const sum = sumBy(array, property);
    return sum / array.length;
}

/**
 * Encontra valor mínimo em array
 */
export function minBy(array, property) {
    if (!Array.isArray(array) || array.length === 0) return null;
    
    return array.reduce((min, item) => {
        const value = parseFloat(item[property]) || 0;
        const minValue = parseFloat(min[property]) || 0;
        return value < minValue ? item : min;
    });
}

/**
 * Encontra valor máximo em array
 */
export function maxBy(array, property) {
    if (!Array.isArray(array) || array.length === 0) return null;
    
    return array.reduce((max, item) => {
        const value = parseFloat(item[property]) || 0;
        const maxValue = parseFloat(max[property]) || 0;
        return value > maxValue ? item : max;
    });
}

/**
 * Verifica se objeto está vazio
 */
export function isEmpty(obj) {
    if (obj === null || obj === undefined) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    if (typeof obj === 'string') return obj.trim() === '';
    return false;
}

/**
 * Clona objeto profundamente
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (Array.isArray(obj)) return obj.map(item => deepClone(item));
    
    const cloned = {};
    Object.keys(obj).forEach(key => {
        cloned[key] = deepClone(obj[key]);
    });
    
    return cloned;
}

/**
 * Mescla objetos profundamente
 */
export function deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();
    
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        });
    }
    
    return deepMerge(target, ...sources);
}

/**
 * Verifica se valor é objeto
 */
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Obtém valor aninhado de objeto
 */
export function getNestedValue(obj, path, defaultValue = null) {
    if (!obj || typeof path !== 'string') return defaultValue;
    
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
        if (current === null || current === undefined || !(key in current)) {
            return defaultValue;
        }
        current = current[key];
    }
    
    return current;
}

/**
 * Define valor aninhado em objeto
 */
export function setNestedValue(obj, path, value) {
    if (!obj || typeof path !== 'string') return;
    
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
}

/**
 * Gera cores aleatórias para gráficos
 */
export function generateColors(count) {
    const colors = [];
    const hueStep = 360 / count;
    
    for (let i = 0; i < count; i++) {
        const hue = i * hueStep;
        const saturation = 70 + (i % 3) * 10; // 70%, 80%, 90%
        const lightness = 50 + (i % 2) * 10;  // 50%, 60%
        
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    
    return colors;
}

/**
 * Converte cor HSL para HEX
 */
export function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Detecta dispositivo móvel
 */
export function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Detecta modo escuro do sistema
 */
export function isDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Obtém informações do navegador
 */
export function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';
    else if (ua.includes('Opera')) browser = 'Opera';
    
    return {
        browser,
        userAgent: ua,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
    };
}

/**
 * Formata bytes em formato legível
 */
export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Gera hash simples de string
 */
export function simpleHash(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash);
}

/**
 * Valida se string é JSON válido
 */
export function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Retry function com backoff exponencial
 */
export async function retry(fn, maxAttempts = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxAttempts) throw error;
            
            const backoffDelay = delay * Math.pow(2, attempt - 1);
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
    }
}

/**
 * Timeout para promises
 */
export function withTimeout(promise, timeoutMs) {
    return Promise.race([
        promise,
        new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeoutMs)
        )
    ]);
}

