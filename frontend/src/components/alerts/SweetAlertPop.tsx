import Swal, { SweetAlertIcon } from "sweetalert2";

interface ShowAlertProps {
  title: string;
  text: string;
  icon: SweetAlertIcon;
  timer?: number;
  timerProgressBar?: boolean;
  confirmButtonText?: string;
}

export const showAlert = (option: ShowAlertProps) => {
  return Swal.fire({
    title: option.title,
    text: option.text,
    icon: option.icon,
    timer: option.timer ?? 1500,
    timerProgressBar: option.timerProgressBar ?? true,
    confirmButtonText: option.confirmButtonText ?? "Ok",
  });
};

export async function sweet_request<T>(
  option: { title: string; text: string },
  tryFn: () => Promise<T>,
  catchFn?: (err: unknown) => void,
) {
  Swal.fire({
    title: option.title,
    text: option.text,
    allowOutsideClick: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const result = await tryFn();
    Swal.close();
    return result;
  } catch (err) {
    Swal.close();
    if (catchFn) {
      catchFn(err);
    }
  }
}
