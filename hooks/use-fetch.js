import { toast } from "sonner";

const { useCallback, useEffect, useRef, useState } = require("react")

const useFetch= (cb)=>{
    const [data, setData]= useState(undefined);
    const [loading, setLoading]= useState(false);
    const [error, setError]= useState(null);
    const mountedRef = useRef(true);
    const requestIdRef = useRef(0);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const fn = useCallback(async(...args)=>{
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        setLoading(true);
        setError(null);

        try {
            const response= await cb(...args);
            if (mountedRef.current && requestIdRef.current === requestId) {
                setData(response);
                setError(null);
            }
            return response;
        } catch (error) {
            if (mountedRef.current && requestIdRef.current === requestId) {
                setError(error);
                toast.error(error.message);
            }
            return undefined;
        }finally{
            if (mountedRef.current && requestIdRef.current === requestId) {
                setLoading(false);
            }
        }

    }, [cb]);

    return { data, loading, error, fn, setData};

};

export default useFetch;
