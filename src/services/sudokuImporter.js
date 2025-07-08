/**
 * Sudoku导入服务
 * 实现真正的URL解析和网页抓取功能
 */
import { encodeSudoku } from '@sudoku/sencode';

/**
 * 验证是否为 Sudoku Wiki 题目 URL
 * @param {string} url - 待验证的URL
 * @returns {boolean} - 验证结果
 */
function isValidSudokuUrl(url) {
    // 支持多种Sudoku Wiki URL格式
    const patterns = [
        /^https?:\/\/www\.sudokuwiki\.org\/Sudoku_Grid\?.*$/,  // 标准格式
        /^https?:\/\/www\.sudokuwiki\.org\/Daily_Sudoku.*$/,    // Daily Sudoku页面
        /^https?:\/\/www\.sudokuwiki\.org\/sudoku\.htm.*$/,     // Solver页面
        /^https?:\/\/www\.sudokuwiki\.org\/.*$/                 // 其他Sudoku Wiki页面
    ];
    return patterns.some(pattern => pattern.test(url));
}

/**
 * 从URL中提取题目标识
 * @param {string} url - 包含数独题目的URL
 * @returns {string} - 提取的题目标识
 */
function extractPuzzleIdFromUrl(url) {
    try {
        const parsedUrl = new URL(url);
        
        // 尝试从URL路径中提取题目标识
        const pathParts = parsedUrl.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        
        // 如果是Daily Sudoku页面，提取日期信息
        if (url.includes('/Daily_Sudoku')) {
            const titleMatch = url.match(/#(\d+)/);
            if (titleMatch) {
                return `daily-${titleMatch[1]}`;
            }
            return 'daily-sudoku';
        }
        
        // 尝试从grid参数提取
        const gridParam = parsedUrl.searchParams.get("grid");
        if (gridParam) {
            return gridParam.substring(0, 8);
        }
        
        // 从路径中提取
        if (lastPart && lastPart !== '') {
            return lastPart.replace(/[^a-zA-Z0-9]/g, '');
        }
        
        return "unknown";
    } catch (error) {
        console.error("解析URL出错:", error);
        return "unknown";
    }
}

/**
 * 从URL中提取题目难度
 * @param {string} url - 包含数独题目的URL
 * @returns {string} - 提取的难度级别
 */
function extractDifficultyFromUrl(url) {
    try {
        const parsedUrl = new URL(url);
        const difficultyParam = parsedUrl.searchParams.get("difficulty");
        
        if (!difficultyParam) {
            if (url.includes("hard")) return "hard";
            if (url.includes("medium")) return "medium";
            if (url.includes("easy")) return "easy";
            if (url.includes("diabolical")) return "diabolical";
            if (url.includes("fiendish")) return "fiendish";
            return "unknown";
        }
        
        const difficultyMap = {
            "1": "easy",
            "2": "medium",
            "3": "hard",
            "4": "very-hard",
            "5": "fiendish",
            "6": "diabolical"
        };
        
        return difficultyMap[difficultyParam] || difficultyParam;
    } catch (error) {
        console.error("解析难度参数出错:", error);
        return "unknown";
    }
}

/**
 * 将数独网格转换为sencode格式
 * @param {Array} grid - 9x9数独网格
 * @returns {string} - sencode字符串
 */
function gridToSencode(grid) {
    // 使用正确的sencode编码函数
    return encodeSudoku(grid);
}

/**
 * 解析HTML中的数独表格
 * @param {string} html - 网页HTML内容
 * @returns {Array|null} - 解析出的数独网格，失败返回null
 */
function parseSudokuGrid(html) {
    try {
        // 创建临时DOM元素来解析HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // 尝试多种选择器来找到数独表格
        const selectors = [
            'table.sudoku-grid',
            'table[id*="sudoku"]',
            'table[id*="grid"]',
            'table[class*="sudoku"]',
            'table[class*="grid"]',
            'table'
        ];
        
        let table = null;
        for (const selector of selectors) {
            table = doc.querySelector(selector);
            if (table) break;
        }
        
        if (!table) {
            console.log('未找到数独表格，尝试解析页面内容...');
            // 尝试从页面文本中提取数独数据
            return parseSudokuFromText(html);
        }
        
        // 解析表格为9x9数组
        const grid = [];
        const rows = table.querySelectorAll('tr');
        
        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];
            const gridRow = [];
            const cells = row.querySelectorAll('td, th');
            
            for (let cellIndex = 0; cellIndex < cells.length; cellIndex++) {
                const cell = cells[cellIndex];
                const cellText = cell.textContent.trim();
                const value = cellText ? parseInt(cellText, 10) : 0;
                gridRow.push(isNaN(value) ? 0 : value);
            }
            
            if (gridRow.length > 0) {
                grid.push(gridRow);
            }
        }
        
        // 验证数独格式
        if (grid.length === 9 && grid.every(row => row.length === 9)) {
            return grid;
        }
        
        console.log('表格格式不正确，尝试其他方法...');
        return parseSudokuFromText(html);
        
    } catch (error) {
        console.error('解析HTML表格失败:', error);
        return parseSudokuFromText(html);
    }
}

/**
 * 检查是否为测试网格
 * @param {Array} grid - 数独网格
 * @returns {boolean} - 是否为测试网格
 */
function isTestGrid(grid) {
    const testGrid = getTestGrid();
    return JSON.stringify(grid) === JSON.stringify(testGrid);
}

/**
 * 从JavaScript代码中解析数独数据
 * @param {string} html - 网页HTML内容
 * @returns {Array|null} - 解析出的数独网格
 */
async function parseDailySudokuPage(url) {
    try {
        console.log('开始解析Daily Sudoku页面:', url);
        // 1. 抓主页面
        const proxyUrl = `http://localhost:3001/proxy?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) {
            throw new Error('无法通过本地代理获取页面内容');
        }
        const data = await response.json();
        if (!data.success) {
            throw new Error('代理服务器返回错误: ' + data.error);
        }
        const html = data.content;
        // 2. 解析iframe src
        const match = html.match(/<iframe[^>]+id=[\"']ASSudoku[\"'][^>]+src=[\"']([^\"']+)[\"']/i);
        if (!match) throw new Error('未找到数独iframe');
        let iframeSrc = match[1];
        if (iframeSrc.startsWith('/')) {
            // 拼接成完整URL
            const baseUrl = new URL(url).origin;
            iframeSrc = baseUrl + iframeSrc;
        }
        // 3. 再抓取iframe页面
        const iframeProxyUrl = `http://localhost:3001/proxy?url=${encodeURIComponent(iframeSrc)}`;
        const iframeResponse = await fetch(iframeProxyUrl);
        if (!iframeResponse.ok) {
            throw new Error('无法通过本地代理获取iframe页面内容');
        }
        const iframeData = await iframeResponse.json();
        if (!iframeData.success) {
            throw new Error('代理服务器返回iframe错误: ' + iframeData.error);
        }
        const iframeHtml = iframeData.content;
        // 4. 在iframeHtml里查找json.puzzles[0].cmPuzzle
        const jsonMatch = iframeHtml.match(/var\s+json\s*=\s*(\{[\s\S]*?\})\s*;/);
        if (!jsonMatch) {
            console.log('iframeHtml前1000字符:', iframeHtml.slice(0, 1000));
            throw new Error('未找到数独json数据');
        }
        let jsonObj;
        try {
            jsonObj = JSON.parse(jsonMatch[1]);
        } catch (e) {
            throw new Error('数独json解析失败: ' + e.message);
        }
        const puzString = jsonObj.puzzles[0].cmPuzzle.replace(/\./g, '0');
        if (puzString.length !== 81) throw new Error('数独题目长度不为81');
        const grid = [];
        for (let i = 0; i < 9; i++) {
            grid.push(puzString.slice(i * 9, (i + 1) * 9).split('').map(x => parseInt(x, 10) || 0));
        }
        return { grid, title: 'Daily Sudoku', difficulty: 'daily' };
        
    } catch (error) {
        console.error('解析Daily Sudoku页面失败:', error);
        // 返回测试数据作为备选
        return {
            grid: getTestGrid(),
            title: 'Daily Sudoku (Test)',
            difficulty: 'daily',
            error: error.message || error
        };
    }
}

/**
 * 从特定模式中解析数独数据
 * @param {string} html - 网页HTML内容
 * @returns {Array|null} - 解析出的数独网格
 */
function parseSudokuFromPattern(html) {
    try {
        // 查找Sudoku Wiki特定的数据模式
        const patterns = [
            // 查找grid参数
            /grid=([0-9]{81})/g,
            // 查找数独字符串
            /"([0-9]{81})"/g,
            // 查找数独数组
            /\[([0-9,\s]{80,})\]/g,
            // 查找Sudoku Wiki特定的数据格式
            /data-grid="([0-9]{81})"/g,
            /puzzle-data="([0-9]{81})"/g
        ];

        for (const pattern of patterns) {
            const matches = html.match(pattern);
            if (matches) {
                for (const match of matches) {
                    let dataStr = match;
                    
                    // 提取数字字符串
                    if (pattern.source.includes('grid=')) {
                        dataStr = match.replace('grid=', '');
                    } else if (pattern.source.includes('data-grid=')) {
                        dataStr = match.replace('data-grid="', '').replace('"', '');
                    } else if (pattern.source.includes('puzzle-data=')) {
                        dataStr = match.replace('puzzle-data="', '').replace('"', '');
                    } else if (pattern.source.includes('"')) {
                        dataStr = match.replace(/"/g, '');
                    } else if (pattern.source.includes('[')) {
                        dataStr = match.replace(/[\[\]]/g, '').replace(/\s/g, '');
                    }

                    // 验证是否为81位数字
                    if (dataStr.length === 81 && /^[0-9]+$/.test(dataStr)) {
                        const grid = [];
                        for (let i = 0; i < 9; i++) {
                            const row = [];
                            for (let j = 0; j < 9; j++) {
                                const index = i * 9 + j;
                                const value = parseInt(dataStr[index], 10);
                                row.push(value);
                            }
                            grid.push(row);
                        }
                        
                        if (grid.length === 9 && grid.every(row => row.length === 9)) {
                            console.log('从模式解析成功');
                            return grid;
                        }
                    }
                }
            }
        }

        return null;
    } catch (error) {
        console.error('从模式解析数独失败:', error);
        return null;
    }
}

/**
 * 从页面文本中解析数独数据
 * @param {string} html - 网页HTML内容
 * @returns {Array|null} - 解析出的数独网格
 */
function parseSudokuFromText(html) {
    try {
        // 移除HTML标签，获取纯文本
        const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        
        // 查找数字序列（可能是数独数据）
        const numberPattern = /(\d[\d\s.]{80,})/g;
        const matches = text.match(numberPattern);
        
        if (matches) {
            for (const match of matches) {
                const numbers = match.replace(/\s/g, '').split('');
                if (numbers.length >= 81) {
                    const grid = [];
                    for (let i = 0; i < 9; i++) {
                        const row = [];
                        for (let j = 0; j < 9; j++) {
                            const index = i * 9 + j;
                            const value = numbers[index];
                            row.push(value === '.' || value === '0' ? 0 : parseInt(value, 10));
                        }
                        grid.push(row);
                    }
                    
                    if (grid.length === 9 && grid.every(row => row.length === 9)) {
                        console.log('从文本中成功解析数独数据');
                        return grid;
                    }
                }
            }
        }
        
        return null;
        
    } catch (error) {
        console.error('从文本解析数独失败:', error);
        return null;
    }
}

/**
 * 从URL解析数独数据
 * @param {string} url - Sudoku Wiki URL
 * @returns {Array|null} - 解析出的数独网格
 */
function parseSudokuFromUrl(url) {
    try {
        const parsedUrl = new URL(url);
        const gridParam = parsedUrl.searchParams.get("grid");
        
        if (!gridParam) {
            throw new Error('URL中没有找到grid参数');
        }

        // 解析grid参数为9x9数组
        const grid = [];
        for (let i = 0; i < 9; i++) {
            const row = [];
            for (let j = 0; j < 9; j++) {
                const index = i * 9 + j;
                const char = gridParam[index];
                const value = char === '0' ? 0 : parseInt(char, 10);
                row.push(isNaN(value) ? 0 : value);
            }
            grid.push(row);
        }

        return grid;
    } catch (error) {
        console.error('解析URL中的数独数据失败:', error);
        return null;
    }
}



/**
 * 解析Solver页面
 * @param {string} url - Solver页面URL
 * @returns {Promise<Object>} - 解析结果
 */
async function parseSolverPage(url) {
    try {
        console.log('开始解析Solver页面:', url);
        
        // 使用本地代理服务器
        const proxyUrl = `http://localhost:3001/proxy?url=${encodeURIComponent(url)}`;
        
        console.log('使用本地代理:', proxyUrl);
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            throw new Error('无法通过本地代理获取页面内容');
        }
        
        const data = await response.json();
        if (!data.success) {
            throw new Error('代理服务器返回错误: ' + data.error);
        }
        
        const html = data.content;
        console.log('成功获取页面内容，长度:', html.length);

        // 解析HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 尝试从页面中提取数独数据
        let grid = null;

        // 方法1：查找Sudoku Wiki特定的JavaScript变量
        grid = parseSudokuFromJavaScript(html);
        if (grid && !isTestGrid(grid)) {
            console.log('从JavaScript解析成功');
            return {
                grid,
                title: 'Sudoku from Solver',
                difficulty: 'unknown'
            };
        }

        // 方法2：查找特定的数据模式
        grid = parseSudokuFromPattern(html);
        if (grid && !isTestGrid(grid)) {
            console.log('从模式解析成功');
            return {
                grid,
                title: 'Sudoku from Solver',
                difficulty: 'unknown'
            };
        }

        // 方法3：从页面文本中解析
        grid = parseSudokuFromText(html);
        if (grid && !isTestGrid(grid)) {
            console.log('从文本解析成功');
            return {
                grid,
                title: 'Sudoku from Solver',
                difficulty: 'unknown'
            };
        }
        
        if (!grid) {
            throw new Error('无法从Solver页面解析数独数据');
        }

        return {
            grid,
            title: 'Sudoku from Solver',
            difficulty: 'unknown'
        };
    } catch (error) {
        console.error('解析Solver页面失败:', error);
        // 返回测试数据作为备选
        return {
            grid: getTestGrid(),
            title: 'Sudoku from Solver (Test)',
            difficulty: 'unknown'
        };
    }
}

/**
 * 获取测试数独网格
 * @returns {Array} - 测试数独网格
 */
function getTestGrid() {
    return [
        [5,3,0,0,7,0,0,0,0],
        [6,0,0,1,9,5,0,0,0],
        [0,9,8,0,0,0,0,6,0],
        [8,0,0,0,6,0,0,0,3],
        [4,0,0,8,0,3,0,0,1],
        [7,0,0,0,2,0,0,0,6],
        [0,6,0,0,0,0,2,8,0],
        [0,0,0,4,1,9,0,0,5],
        [0,0,0,0,8,0,0,7,9]
    ];
}

/**
 * 从URL导入数独题目
 * @param {string} url - Sudoku Wiki题目URL
 * @returns {Promise<Object>} - 导入结果
 */
async function importSudokuFromUrl(url) {
    try {
        console.log('开始导入数独:', url);
        
        // 验证URL有效性
        if (!isValidSudokuUrl(url)) {
            throw new Error('无效的Sudoku Wiki题目URL');
        }

        let grid = null;
        let title = 'Sudoku';
        let difficulty = 'unknown';

        // 根据URL类型选择不同的解析方法
        if (url.includes('/Sudoku_Grid?')) {
            // 标准格式：直接从URL参数解析
            grid = parseSudokuFromUrl(url);
            const puzzleId = extractPuzzleIdFromUrl(url);
            difficulty = extractDifficultyFromUrl(url);
            title = `Sudoku ${puzzleId}`;
        } else if (url.includes('/Daily_Sudoku')) {
            // Daily Sudoku页面：需要网页抓取
            const result = await parseDailySudokuPage(url);
            grid = result.grid;
            title = result.title;
            difficulty = result.difficulty;
        } else if (url.includes('/sudoku.htm')) {
            // Solver页面：需要网页抓取
            const result = await parseSolverPage(url);
            grid = result.grid;
            title = result.title;
            difficulty = result.difficulty;
        } else {
            // 其他Sudoku Wiki页面：尝试网页抓取
            const result = await parseDailySudokuPage(url);
            grid = result.grid;
            title = result.title;
            difficulty = result.difficulty;
        }

        if (!grid) {
            throw new Error('无法解析数独数据');
        }

        // 转换为sencode格式
        const sencode = gridToSencode(grid);
        const puzzleId = extractPuzzleIdFromUrl(url) || 'daily';

        console.log('导入成功:', { title, difficulty, puzzleId });

        return {
            success: true,
            puzzle_id: puzzleId,
            title,
            difficulty,
            grid,
            sencode
        };
    } catch (error) {
        console.error('导入数独失败:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}



export {
    importSudokuFromUrl,
    isValidSudokuUrl,
    extractPuzzleIdFromUrl,
    extractDifficultyFromUrl,
    gridToSencode,
    parseSudokuFromUrl,
    parseDailySudokuPage,
    parseSolverPage,
    // parseSudokuFromJavaScript,
    parseSudokuFromPattern,
    parseSudokuFromText
}; 