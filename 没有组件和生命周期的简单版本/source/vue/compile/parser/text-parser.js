const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

export function parseText(text){
    const tagRE = defaultTagRE;
    if(!tagRE.test(text)){
        return
    }

    const tokens = []               //存储匹配的text内容，以队列的方式可以保证顺序
    const rawTokens = []
    let lastIndex = tagRE.lastIndex = 0;
    let match, index, tokenValue
    while((match = tagRE.exec(text))){      //循环匹配文本中的双括号表达式
        index = match.index;
        if(index>lastIndex){            //将除了括号之外的内容存储起来
            rawTokens.push(tokenValue = text.slice(lastIndex,index))
            tokens.push(JSON.stringify(tokenValue))
        }

        const exp = match[1].trim();            //双括号内的变量
        tokens.push(`_s(${exp})`)
        rawTokens.push({'@binding':exp});
        lastIndex = index + match[0].length    //跳过已经匹配的项
    }
    if(lastIndex < text.length){                //记录剩下的最后的文本
        rawTokens.push(tokenValue = text.slice(lastIndex))
        tokens.push(JSON.stringify(tokenValue))
    }
    return {
        expression:tokens.join('+'),
        tokens:rawTokens
    }
}