import Some from "./Some";

function pick<T extends Record<string, number | any>, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Pick<T, K> {
  return keys.reduce(
    (subObject, key) => {
      subObject[key] = Some.Object<T>(obj)[key];
      return subObject;
    },
    {} as Pick<T, K>
  );
}
export default pick;
