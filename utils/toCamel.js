function snakeToCamelCase(str) {
    return str
      .replace(/_([a-z])/g, (match, p1) => p1.toUpperCase())
      .replace(/_+/g, '')
}

exports.convertKeysToCamelCase = function convertKeysToCamelCase(obj) {
    if (Array.isArray(obj)) {
        return obj.map(convertKeysToCamelCase)
    } else if (obj instanceof Date) {
        return obj
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((result, key) => {
        const camelCaseKey = snakeToCamelCase(key)
        result[camelCaseKey] = convertKeysToCamelCase(obj[key])
        return result
        }, {})
    }
    return obj
    }
  