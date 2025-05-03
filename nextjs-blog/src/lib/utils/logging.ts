import * as util from "util";

/**
 * Log an object with pretty formatting for better debugging
 * @param label Description of what's being logged
 * @param obj Object to log
 */
export const logObject = <T>(label: string, obj: T): void => {
  console.log(
    `${label}:`,
    util.inspect(obj, {
      depth: null,
      colors: true,
      maxArrayLength: 50,
      maxStringLength: 500,
    })
  );
};
