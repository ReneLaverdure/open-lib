export default class AliteErrors extends Error {
  status: number;
  statusText: string;

  constructor(status: number, statusText: string) {
    super(`HTTP error: ${status} ${statusText}`);
    this.status = status;
    this.statusText = statusText;
  }
}
