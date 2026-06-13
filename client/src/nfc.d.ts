// --- 1. YOZISH UCHUN TIPLAR (ndef.write uchun) ---
type NDEFRecordDataSource = string | BufferSource | NDEFMessageInit;

interface NDEFRecordInit {
  recordType: string;
  mediaType?: string;
  id?: string;
  data?: NDEFRecordDataSource;
}

interface NDEFMessageInit {
  records: NDEFRecordInit[];
}

// write() funksiyasi string, buffer yoki maxsus obyektni qabul qila oladi
type NDEFMessageSource = string | BufferSource | NDEFMessageInit;


// --- 2. O'QISH UCHUN TIPLAR (onreading hodisasi uchun) ---
interface NDEFRecord {
  readonly recordType: string;
  readonly mediaType?: string;
  readonly id?: string;
  readonly data?: DataView; // O'qilganda doim DataView qaytadi
}

interface NDEFMessage {
  readonly records: NDEFRecord[];
}

interface NDEFReadingEvent extends Event {
  readonly serialNumber: string;
  readonly message: NDEFMessage;
}


// --- 3. ASOSIY KLASS ---
declare class NDEFReader extends EventTarget {
  constructor();
  
  scan(options?: { signal?: AbortSignal }): Promise<void>;
  
  // Endi write() metodi NDEFMessageInit-ni bemalol qabul qiladi
  write(
    message: NDEFMessageSource,
    options?: { signal?: AbortSignal }
  ): Promise<void>;
  
  onreading: ((this: NDEFReader, event: NDEFReadingEvent) => any) | null;
  onreadingerror: ((this: NDEFReader, event: Event) => any) | null;
}

interface Window {
  NDEFReader: typeof NDEFReader;
}