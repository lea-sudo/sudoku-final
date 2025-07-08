// 数独相关常量
export const SUDOKU_SIZE = 9;
export const BOX_SIZE = 3;
export const MAXLEVEL = 3;

// 策略优先级配置
export const STRATEGY_PRIORITY = {
    'PossibleNumber': 1,
    'NakedPairs': 2,
    'HiddenPairs': 3,
    'Xwing': 4
};

// 策略性能配置
export const PERFORMANCE_THRESHOLDS = {
    fast: 2.0,    // 2ms以下为快速
    medium: 5.0,  // 5ms以下为中等
    slow: 10.0    // 10ms以上为缓慢
};