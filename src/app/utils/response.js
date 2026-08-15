// utils/response.js

export const successResponse = (data, message = "Success", status = 200) => {
  return Response.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
};

export const errorResponse = (message = "Error", status = 500, errors = null) => {
  return Response.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  );
};