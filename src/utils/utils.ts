import { StringDate } from "./types";
const config = require('config');

export const generateCode = (length: number, isAlphaNumeric: Boolean): string => {
    if (!isAlphaNumeric) { isAlphaNumeric = false }
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    if (isAlphaNumeric) {
        characters += '0123456789';
    }
    var charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// export const formatPhoneNumber = (phoneNumber: string): string => {
//   let formatted = phoneNumber
//   if(phoneNumber.charAt(0) === '+') {
//     const substring = phoneNumber.slice(4);
//     formatted = '0'+substring
//   } 
//   return formatted

// }

export const parseResponse = (data: any) => {
    try {
      data = JSON.parse(data);
      // console.log('IN PARSE FUNCTION ===>', data)
      return data;
    } catch (error: any) {
        console.log('=====< PARSE ERROR=====>', JSON.parse(error) || JSON.parse(error.body))
    }
    // return data;
  };

const Buffer = require("buffer/").Buffer;

export const  _encodeUrl = function(url: any) {
  return encodeURIComponent(url);
};

// Base 64
export const  getBase64 = function(str: string) {
  return new Buffer(str).toString("base64");
};

export const  getPassportHeader = function(clientid: any, secret: any) {
  return getBase64(clientid + ":" + secret);
};

export const  encodeExtraData = function(extraData: any) {
  var encoded: any = "";
  for (var i = 0, lens = extraData.length; i < lens; i++) {
    encoded += _encodeUrl(extraData[i]) + "&";
  }
  return (encoded = encoded.substr(0, encoded));
};

export const slugify = (string: string) => {
  return string
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export const errorResponse = (message: any) => {
  return {
    success: false,
    error: message
  };
};

export const messageResponse = (message: any) => {
  return {
    success: true,
    message: message
  };
};

export const dataResponse = (message: any, data: any) => {
  return {
    success: true,
    message: message,
    data: data
  };
};

export const isInArray = (value: any, array: any) => {
  if (Array.isArray(array)) {
    return array.includes(value);
  } else {
    return false;
  }
};

export function isValidEmail(email: string) {
  const valid = new RegExp(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
  return valid.test(email);
}

export function isValidPhoneNumber(phone: string) {
  const valid = RegExp(/^\d{4}\d{3}\d{4}$/);
  return valid.test(phone);
}

export function getDateStringFromTime(time: string) {
  let currentDate = new Date(time);
  return currentDate.getDate() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear();
}

export const validatePhoneNumber = (phoneString: string) => {
  if (!isValidPhoneNumber(phoneString)) {
    throw new Error("Invalid phone number");
  }
};

export const validateEmailString = (emailString: string) => {
  console.log(emailString);

  if (!isValidEmail(emailString)) {
    throw new Error("Invalid email address");
  }
};

export const validateNameString = (label: any, nameString: any) => {
  if (nameString.length < 2) {
    throw new Error(`${label} must be at least 2 characters long.`);
  }
};

export const validateFullNameString = (label: any, nameString: any) => {
  if (nameString.length < 2) {
    throw new Error(`${label} must be at least 2 characters long.`);
  }
};

export const validateRequiredProperty = (label: any, objectString: any) => {
  if (objectString == null || objectString == undefined || objectString == "undefined") {
    throw new Error(`${label} must be provided.`);
  }
};

export const validateRequiredStringProperty = (label: any, objectString: any) => {
  if (objectString == null || objectString == undefined || objectString == "undefined") {
    throw new Error(`${label} must be provided.`);
  }
  if (typeof objectString != "string") {
    throw new Error(`${label} has an invalid data type.`);
  }
};

export const validateRequiredNumericProperty = (label: any, objectString:any) => {
  objectString = +objectString;
  if (objectString == null || objectString == undefined || objectString == "undefined") {
    throw new Error(`${label} must be provided.`);
  }
  if (typeof objectString != "number") {
    throw new Error(`${label} has an invalid data type.`);
  }
};

export function addDays(numOfDays: number, date = new Date()) {
  const dateCopy = new Date(date.getTime());

  dateCopy.setDate(dateCopy.getDate() + numOfDays);

  return dateCopy;
}

export const formatPhone = (phone: string) => {
  let formatted =""
  if (!phone || phone === '') {
      return ""
  }

  if (phone.charAt(0) === '0') {
      formatted = '+234' + phone.substring(1)
  } else {
      formatted = phone
  }

  return formatted
}


export const formatPhoneNumber = (phoneNumber: string): string => {
  let formatted = phoneNumber
  if(phoneNumber.charAt(0) === '+') {
    const substring = phoneNumber.slice(4);
    formatted = '0'+substring
  } 
  return formatted

}

export const addMinutesToDate = (date: Date, minutes: number) => {
  date.setMinutes(date.getMinutes() + minutes);

  return date;
}

export const snakeToCamel = (obj: Record<string, any>): Record<string, any> => {
  if(!obj) {
    return {}
  }

  const camelObj: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_\w/g, (match) => match[1].toUpperCase());
    if (Array.isArray(value)) {
      camelObj[camelKey] = value.map((item) =>
        typeof item === "object" ? snakeToCamel(item) : item
      );
    } else {
      camelObj[camelKey] =
        typeof value === "object" ? snakeToCamel(value) : value;
    }
  }

  return camelObj;
}


export const getJsDate = (stringDate: StringDate | any): Date => {
  if (!stringDate) return new Date()

  var dateParts: any = stringDate.split("-");

  // month is 0-based, that's why we need dataParts[1] - 1
  var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]); 

  return dateObject;
}

export const months = {
  '01': 'Jan',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Apr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Aug',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dec',
}

export const parseDateForMonnify = (stringDate: string) => {
  if(!stringDate || stringDate === '') return ''

  var dateParts: any = stringDate.split("-");
  const day = dateParts[0]
  const month = months[dateParts[1] as keyof typeof months]
  const year = dateParts[2]
  
  return `${day}-${month}-${year}`
} 

export const checkIsConsecutive = (array: any, field: string) => {
  return Boolean(array.reduce((res: any, cur: any) => (res ? (Number(res[field]) + 1 === Number(cur[field]) ? cur : false) : false)));
}


export const foundDuplicateStrings = (stringArray: string[]) => {
  if(!stringArray) {return true}
  let duplicateItems = stringArray.filter((item, index) => stringArray.indexOf(item) != index);

  if (duplicateItems) {
    console.log("Array contains the following duplicate elements");
    console.log(duplicateItems); // [“a”]
    return true
  } else {
    return false
  }
}

export const formatBizgemDate = (date: Date): string => {
  if(!date) {return ''}

  const formatted = (date.getDate().toString().length != 2 ?"0" + date.getDate() : date.getDate()) + "-" +((date.getMonth()+1).toString().length != 2 ? "0" + (date.getMonth() + 1) : (date.getMonth()+1)) + "-" + date.getFullYear();

  return formatted
}

export interface PostMeta {
  wordCount: number
  readTime: number
  readTimeUnit: string
  readTimeBasis: string
}

export const getPostMeta = (postBody: string): PostMeta => {
  const stringWithoutTags = postBody.replace(/(<([^>]+)>)/gi, '');
  config.geoTravelSettings.forbiddenUserFields

  // Remove special characters using regex
  const stringWithoutSpecialChars = stringWithoutTags.replace(/[^\w\s]/gi, '');
  const readRate = config.geoTravelSettings.postReadRate
  const wordCount = stringWithoutSpecialChars.split('').length
  const readTimeInMinutes = wordCount/readRate

  return {
    wordCount,
    readTime: readTimeInMinutes,
    readTimeBasis: readRate,
    readTimeUnit: 'minutes'
  }

}

export const replaceEmailVariables = (input: string, variableValues: Record<string, string>): string => {
  const regex = /\[\[\s*([\w\s]+)\s*\]\]/g;

  const replacedString = input.replace(regex, (match, variableName) => {
    if (variableValues.hasOwnProperty(variableName)) {
      return variableValues[variableName];
    }
    return match; // Keep unchanged if value not found in the map
  });

  return replacedString;
}

export const returnDocuments = (array: any[]) => {
  return array.map(item => {
      // console.log(item)
      if(item.document) {
          // console.log('no doc here')
          let document = item.document
          // if(item._id){
          //     document._id = item._id
          // }
          return document
      }
  })
}

export const replaceDocumentVariables = (input: string, variableValues: Record<string, string>): string => {
  const regex = /\[\[\s*([\w\s]+)\s*\]\]/g;

  const replacedString = input.replace(regex, (match, variableName) => {
    if (variableValues.hasOwnProperty(variableName)) {
      return variableValues[variableName];
    }
    return match; // Keep unchanged if value not found in the map
  });

  return replacedString;
}


export const unSlugify = (string: string) => {
  if(!string || string === '') {
      return
  }
  return string.replace(/[_-]/g, " "); 
  // return string.replace(/[^0-9_-]/g, ' ')
}

const crypto = require('crypto');

// Function to generate a cryptographically secure random API key
export const generateAPIKey = (length: number) => {
  // Define character set for API key generation
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  let apiKey = '';

  // Generate random bytes using Node.js crypto module
  const randomBytes = crypto.randomBytes(length);

  // Populate API key using random bytes
  for (let i = 0; i < randomBytes.length; i++) {
      const byteValue = randomBytes[i];
      apiKey += charset[byteValue % charset.length];
  }

  return apiKey;
}

/**
 * Calculate fee amount based on payment amount
 * Fee is 1.5% of the payment amount, capped at 1000
 * @param paymentAmount - The total payment amount
 * @returns The calculated fee amount
 */
export const calculateFee = (paymentAmount: number): number => {
  const feePercentage = 0.015; // 1.5%
  const maxFee = 1000;
  
  const calculatedFee = paymentAmount * feePercentage;
  
  return Math.min(calculatedFee, maxFee);
}

/**
 * Calculate transfer fee based on transfer amount
 * @param transferAmount - The transfer amount
 * @returns The transfer fee
 */
export const calculateTransferFee = (transferAmount: number): number => {
  if (transferAmount < 50001) {
    return 25;
  } else if (transferAmount <= 50000) {
    return 50;
  } else {
    return 75;
  }
}

