export const baseUrl = "https://backend-cu-recom.up.railway.app/api";

export const postRequest = async (url, body) => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIwMDE3MDY3MDc0OTIwMDAwMDIzMiIsImlhdCI6MTc0MjM4NzQzMCwiZXhwIjoxNzQ0OTc5NDMwfQ.LC66ONxgd5MkHnFrkfQ2pWXAOErBrCBCpQcnSN-cIxY";
  console.log("Post request");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    let message;

    if (data?.message) {
      message = data.message;
    } else {
      message = data;
    }

    return { error: true, status: response.status, message };
  }

  return data;
};

export const getRequest = async (url) => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIwMDE3MDY3MDc0OTIwMDAwMDIzMiIsImlhdCI6MTc0MjM4NzQzMCwiZXhwIjoxNzQ0OTc5NDMwfQ.LC66ONxgd5MkHnFrkfQ2pWXAOErBrCBCpQcnSN-cIxY";
  console.log("Get request");
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log("Response:", response);

  const data = await response.json();

  console.log("Data", data);

  if (!response.ok) {
    let message = "An error occured...";

    if (data?.message) {
      message = data.message;
    }

    return { error: true, status: response.status, message };
  }

  return data;
};
