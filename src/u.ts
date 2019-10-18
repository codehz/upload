function humanFileSize(bytes: number, si: boolean) {
  var thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }
  var units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  var u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + ' ' + units[u];
}

document.body.addEventListener("file-selected", ({ target, detail: file }: Event & { target: FileChooser, detail: File }) => {
  const xhr = new XMLHttpRequest()
  const notify = new UploadProgress
  notify.title = `[${humanFileSize(file.size, false)}] ${file.name}`
  xhr.open('POST', "https://ipfs.infura.io:5001/api/v0/add?wrap-with-directory=true&quieter=true", true)
  xhr.upload.addEventListener("progress", e => {
    notify.progress = e.loaded / e.total
    console.log("sent: %o", e.loaded)
  })
  xhr.addEventListener("error", () => {
    notify.error = "An error occurred while transferring the file."
    notify.done()
  })
  xhr.addEventListener("load", () => {
    try {
      const resp = xhr.responseText.trim().split('\n')
      const data = JSON.parse(resp.pop()) as { Hash: string }
      notify.link(`https://ipfs.io/ipfs/${data.Hash}/${file.name}`)
      notify.done(true)
      notify.add(new CustomButton("folder", () => window.open(`https://ipfs.io/ipfs/${data.Hash}`, '_blank')))
      notify.add(new CustomButton("copy_hash", () => navigator.clipboard.writeText(data.Hash)))
    } catch (e) {
      notify.error = e + ""
      notify.done()
    }
  })
  const data = new FormData()
  data.set("file", file)
  xhr.send(data)
  notify.addEventListener("cancel", () => {
    xhr.abort()
    notify.done()
    notify.error = "Cancelled"
  })
  target.parentElement.appendChild(notify)
})