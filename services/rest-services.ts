import Axios from "axios";
import to from "await-to-js";

export async function getAllAPI(
  apis: string[],
  handleErrorGlobally = true
): { response?: any[]; error?: Error } {
  const combinedRequest: any[] = [];
  apis.forEach((url) => {
    combinedRequest.push(Axios.get(url));
  });

  const [error, combinedResponse] = await to(Axios.all(combinedRequest));

  if (combinedResponse) {
    const finalData: any[] = [];

    combinedResponse.forEach((item) => {
      finalData.push(item.data);
    });

    return { response: finalData };
  }

  if (error) {
    if (handleErrorGlobally) {
      alert(`error handled globally ${error}`);
    } else {
      return { error: error.message };
    }
  }
}

export async function getAPI(
  url: string,
  handleErrorGlobally = true
): { response?: AxiosResponse<any, any>; error?: Error } {
  const [error, response] = await to(Axios.get(url));

  if (response) {
    return { response };
  }

  if (error) {
    if (handleErrorGlobally) {
      alert(`error handled globally ${error}`);
    } else {
      return { error };
    }
  }
}
